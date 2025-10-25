const { app, BrowserWindow, screen, clipboard, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');

let mainWindow;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  // Create the floating window
  mainWindow = new BrowserWindow({
    width: 200,
    height: 50,
    x: Math.round((width - 200) / 2), // Center horizontally
    y: 50, // Position at the top
    frame: false, // No title bar
    transparent: true, // Transparency
    alwaysOnTop: true, // Always on top
    skipTaskbar: true, // Do not appear in taskbar
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the interface
  mainWindow.loadFile('index.html');

  // Keep the window above other applications
  mainWindow.setAlwaysOnTop(true, 'floating');
  
  // Disable automatic focus
  mainWindow.setFocusable(false);
  
  // Open DevTools in development mode
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

// IPC Handlers pour clipboard
ipcMain.handle('get-clipboard-text', async () => {
  return clipboard.readText();
});

ipcMain.handle('set-clipboard-text', async (event, text) => {
  clipboard.writeText(text);
  return true;
});

ipcMain.handle('copy-selected-text', async () => {
  // Simulate Cmd+C to copy selected text
  return new Promise((resolve) => {
    const oldClipboard = clipboard.readText();
    
    // Execute Cmd+C
    exec('osascript -e \'tell application "System Events" to keystroke "c" using command down\'', (error) => {
      if (error) {
        console.error('Error copying:', error);
        resolve({ success: false, text: '' });
        return;
      }
      
      // Wait a bit for clipboard to update
      setTimeout(() => {
        const newText = clipboard.readText();
        resolve({ success: true, text: newText, oldClipboard });
      }, 300);
    });
  });
});

ipcMain.handle('paste-text', async (event, text) => {
  // Set text in clipboard and paste
  clipboard.writeText(text);
  
  return new Promise((resolve) => {
    // First select all (Cmd+A), then paste (Cmd+V)
    exec('osascript -e \'tell application "System Events" to keystroke "a" using command down\'', (error1) => {
      if (error1) {
        console.error('Error selecting all:', error1);
        resolve(false);
        return;
      }
      
      // Wait a bit, then paste
      setTimeout(() => {
        exec('osascript -e \'tell application "System Events" to keystroke "v" using command down\'', (error2) => {
          if (error2) {
            console.error('Error pasting:', error2);
            resolve(false);
            return;
          }
          
          setTimeout(() => resolve(true), 200);
        });
      }, 100);
    });
  });
});

// Nouvelle fonction : Détecter automatiquement le champ de texte actif
ipcMain.handle('get-active-text-field', async () => {
  return new Promise((resolve) => {
    // Script AppleScript pour détecter le champ de texte actif
    const script = `
      tell application "System Events"
        try
          set frontApp to first application process whose frontmost is true
          set appName to name of frontApp
          
          -- Chercher dans différents types de champs de texte
          set textFields to {}
          
          try
            set textFields to text fields of frontApp
          end try
          
          try
            set textAreas to text areas of frontApp
            set textFields to textFields & textAreas
          end try
          
          try
            set textViews to text views of frontApp
            set textFields to textFields & textViews
          end try
          
          if (count of textFields) > 0 then
            set activeField to first item of textFields
            set fieldValue to value of activeField
            set fieldName to name of activeField
            
            return "SUCCESS:" & appName & "|" & fieldName & "|" & fieldValue
          else
            return "NO_FIELDS:" & appName
          end if
        on error errMsg
          return "ERROR:" & errMsg
        end try
      end tell
    `;
    
    exec(`osascript -e '${script}'`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error detecting text field:', error);
        resolve({ success: false, error: error.message });
        return;
      }
      
      const result = stdout.trim();
      console.log('Active text field result:', result);
      
      if (result.startsWith('SUCCESS:')) {
        const parts = result.substring(8).split('|');
        resolve({
          success: true,
          app: parts[0],
          fieldName: parts[1],
          text: parts[2] || ''
        });
      } else if (result.startsWith('NO_FIELDS:')) {
        resolve({
          success: false,
          error: 'No text fields found in ' + result.substring(11)
        });
      } else {
        resolve({
          success: false,
          error: result
        });
      }
    });
  });
});

// Nouvelle fonction : Remplacer le texte dans le champ actif
ipcMain.handle('replace-active-text-field', async (event, newText) => {
  return new Promise((resolve) => {
    // Script AppleScript pour remplacer le texte dans le champ actif
    const script = `
      tell application "System Events"
        try
          set frontApp to first application process whose frontmost is true
          
          -- Chercher le champ de texte actif
          set textFields to {}
          
          try
            set textFields to text fields of frontApp
          end try
          
          try
            set textAreas to text areas of frontApp
            set textFields to textFields & textAreas
          end try
          
          try
            set textViews to text views of frontApp
            set textFields to textFields & textViews
          end try
          
          if (count of textFields) > 0 then
            set activeField to first item of textFields
            
            -- Sélectionner tout le texte
            set value of activeField to ""
            
            -- Mettre le nouveau texte
            set value of activeField to "${newText.replace(/"/g, '\\"')}"
            
            return "SUCCESS"
          else
            return "NO_FIELDS"
          end if
        on error errMsg
          return "ERROR:" & errMsg
        end try
      end tell
    `;
    
    exec(`osascript -e '${script}'`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error replacing text field:', error);
        resolve({ success: false, error: error.message });
        return;
      }
      
      const result = stdout.trim();
      console.log('Replace text field result:', result);
      
      if (result === 'SUCCESS') {
        resolve({ success: true });
      } else {
        resolve({ success: false, error: result });
      }
    });
  });
});

// Application event management
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Allow the window to be dragged
let isDragging = false;
let dragStart = { x: 0, y: 0 };

app.on('web-contents-created', (event, contents) => {
  contents.on('before-input-event', (event, input) => {
    if (input.type === 'mouseDown' && input.button === 'left') {
      // Check if clicking on the draggable area (not on a button)
      const target = input.target;
      if (target && target.classList && target.classList.contains('draggable-area')) {
        isDragging = true;
        dragStart = { x: input.x, y: input.y };
        mainWindow.setFocusable(true);
        mainWindow.focus();
      }
    }
    
    if (input.type === 'mouseMove' && isDragging) {
      const [x, y] = mainWindow.getPosition();
      const deltaX = input.x - dragStart.x;
      const deltaY = input.y - dragStart.y;
      mainWindow.setPosition(x + deltaX, y + deltaY);
      dragStart = { x: input.x, y: input.y };
    }
    
    if (input.type === 'mouseUp') {
      isDragging = false;
    }
  });
});
