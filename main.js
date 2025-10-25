const { app, BrowserWindow, screen, clipboard, globalShortcut, ipcMain, shell } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

let mainWindow;
let onboardingWindow = null;
let errorPopupWindow = null;
let frontmostAppBundleId = null;
let permissionConfig = null;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  // Create the floating window - COMPLETELY NON-ACTIVATING
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
    focusable: false, // NEVER can receive focus
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      disableBlinkFeatures: 'FocusWithoutUserActivation' // Disable focus
    }
  });

  // Load the interface
  mainWindow.loadFile('index.html');

  // Keep the window above other applications - COMPLETELY NON-ACTIVATING
  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  
  // Disable automatic focus - NEVER can receive focus
  mainWindow.setFocusable(false);
  mainWindow.setIgnoreMouseEvents(false); // Allow clicks but don't activate
  
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
  // Simulate Cmd+A then Cmd+C to copy all text
  return new Promise((resolve) => {
    const oldClipboard = clipboard.readText();
    
    // First, execute Cmd+A to select all
    exec('osascript -e \'tell application "System Events" to keystroke "a" using command down\'', (error1) => {
      if (error1) {
        console.error('Error selecting all:', error1);
        resolve({ success: false, text: '' });
        return;
      }
      
      // Wait a bit, then execute Cmd+C
      setTimeout(() => {
        exec('osascript -e \'tell application "System Events" to keystroke "c" using command down\'', (error2) => {
          if (error2) {
            console.error('Error copying:', error2);
            resolve({ success: false, text: '' });
            return;
          }
          
          // Wait for clipboard to update
          setTimeout(() => {
            const newText = clipboard.readText();
            console.log('📋 Copied text from clipboard:', newText?.substring(0, 50));
            resolve({ success: true, text: newText, oldClipboard });
          }, 400);
        });
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

// Fonction pour mémoriser l'app frontmost
ipcMain.handle('remember-frontmost-app', async () => {
  return new Promise((resolve) => {
    const script = `
      tell application "System Events"
        try
          set frontApp to first application process whose frontmost is true
          set appName to name of frontApp
          set bundleId to bundle identifier of frontApp
          return "SUCCESS:" & appName & "|" & bundleId
        on error errMsg
          return "ERROR:" & errMsg
        end try
      end tell
    `;
    
    exec(`osascript -e '${script}'`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error getting frontmost app:', error);
        resolve({ success: false, error: error.message });
        return;
      }
      
      const result = stdout.trim();
      if (result.startsWith('SUCCESS:')) {
        const parts = result.substring(8).split('|');
        frontmostAppBundleId = parts[1];
        resolve({ success: true, appName: parts[0], bundleId: parts[1] });
      } else {
        resolve({ success: false, error: result });
      }
    });
  });
});

// Fonction pour réactiver l'app frontmost
ipcMain.handle('reactivate-frontmost-app', async () => {
  return new Promise((resolve) => {
    if (!frontmostAppBundleId) {
      resolve({ success: false, error: 'No frontmost app remembered' });
      return;
    }
    
    const script = `
      tell application id "${frontmostAppBundleId}"
        activate
      end tell
    `;
    
    exec(`osascript -e '${script}'`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error reactivating app:', error);
        resolve({ success: false, error: error.message });
        return;
      }
      
      // Attendre un peu pour que l'app reprenne le focus
      setTimeout(() => {
        resolve({ success: true });
      }, 200);
    });
  });
});

// Fonction pour sélectionner et copier le texte de l'input focus
ipcMain.handle('select-and-copy-focused-text', async () => {
  return new Promise((resolve) => {
    const oldClipboard = clipboard.readText();
    
    // Sélectionner tout le texte dans le champ focus
    exec('osascript -e \'tell application "System Events" to keystroke "a" using command down\'', (error1) => {
      if (error1) {
        console.error('Error selecting text:', error1);
        resolve({ success: false, text: '', oldClipboard });
        return;
      }
      
      // Attendre un peu puis copier
      setTimeout(() => {
        exec('osascript -e \'tell application "System Events" to keystroke "c" using command down\'', (error2) => {
          if (error2) {
            console.error('Error copying text:', error2);
            resolve({ success: false, text: '', oldClipboard });
            return;
          }
          
          // Attendre que le clipboard se mette à jour
          setTimeout(() => {
            const newText = clipboard.readText();
            resolve({ success: true, text: newText, oldClipboard });
          }, 200);
        });
      }, 100);
    });
  });
});

// Fonction pour coller le texte dans l'input focus
ipcMain.handle('paste-to-focused-input', async (event, text) => {
  return new Promise((resolve) => {
    // Mettre le texte dans le clipboard
    clipboard.writeText(text);
    
    // Sélectionner tout et coller
    exec('osascript -e \'tell application "System Events" to keystroke "a" using command down\'', (error1) => {
      if (error1) {
        console.error('Error selecting all:', error1);
        resolve({ success: false });
        return;
      }
      
      setTimeout(() => {
        exec('osascript -e \'tell application "System Events" to keystroke "v" using command down\'', (error2) => {
          if (error2) {
            console.error('Error pasting:', error2);
            resolve({ success: false });
            return;
          }
          
          setTimeout(() => resolve({ success: true }), 100);
        });
      }, 100);
    });
  });
});

// Fonction pour vérifier les permissions d'accessibilité
ipcMain.handle('check-accessibility-permissions', async () => {
  return new Promise((resolve) => {
    const script = `
      tell application "System Events"
        try
          set frontApp to first application process whose frontmost is true
          set appName to name of frontApp
          return "SUCCESS:" & appName
        on error errMsg
          if errMsg contains "not authorized" then
            return "NO_PERMISSION"
          else
            return "ERROR:" & errMsg
          end if
        end try
      end tell
    `;
    
    exec(`osascript -e '${script}'`, (error, stdout, stderr) => {
      const result = stdout.trim();
      if (result === 'NO_PERMISSION') {
        resolve({ hasPermission: false });
      } else if (result.startsWith('SUCCESS:')) {
        resolve({ hasPermission: true });
      } else {
        resolve({ hasPermission: false, error: result });
      }
    });
  });
});

// MARK: - Native Bridge Functions
function callNativeBridge(command, ...args) {
  return new Promise((resolve) => {
    const bridgePath = path.join(__dirname, 'bin', 'StyloBridge');
    const commandArgs = [command, ...args].map(arg => `"${arg}"`).join(' ');
    
    exec(`"${bridgePath}" ${commandArgs}`, (error, stdout, stderr) => {
      if (error) {
        console.error('Bridge error:', error);
        resolve({ success: false, error: error.message });
        return;
      }
      
      try {
        const result = JSON.parse(stdout.trim());
        resolve(result);
      } catch (parseError) {
        console.error('Bridge parse error:', parseError);
        resolve({ success: false, error: 'Failed to parse bridge response' });
      }
    });
  });
}

// MARK: - Permission Management
function loadPermissionConfig() {
  const configPath = path.join(__dirname, 'permissions.json');
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      permissionConfig = JSON.parse(data);
    } else {
      permissionConfig = {
        hasAccessibility: false,
        hasInputMonitoring: false,
        hasScreenRecording: false,
        onboardingCompleted: false
      };
    }
  } catch (error) {
    console.error('Error loading permission config:', error);
    permissionConfig = {
      hasAccessibility: false,
      hasInputMonitoring: false,
      hasScreenRecording: false,
      onboardingCompleted: false
    };
  }
}

function savePermissionConfig(config) {
  const configPath = path.join(__dirname, 'permissions.json');
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    permissionConfig = config;
  } catch (error) {
    console.error('Error saving permission config:', error);
  }
}

// MARK: - Onboarding Window
function createOnboardingWindow() {
  onboardingWindow = new BrowserWindow({
    width: 700,
    height: 600,
    center: true,
    resizable: false,
    maximizable: false,
    minimizable: false,
    closable: false,
    frame: true,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  onboardingWindow.loadFile('onboarding.html');
  onboardingWindow.setAlwaysOnTop(true);
  onboardingWindow.show();
}

// MARK: - IPC Handlers for Onboarding
ipcMain.handle('checkAllPermissions', async () => {
  const accessibility = await callNativeBridge('checkAccessibility');
  const inputMonitoring = await callNativeBridge('checkInputMonitoring');
  const screenRecording = await callNativeBridge('checkScreenRecording');
  
  return {
    accessibility: accessibility.success,
    inputMonitoring: inputMonitoring.success,
    screenRecording: screenRecording.success
  };
});

ipcMain.handle('checkAccessibilityPermission', async () => {
  return await callNativeBridge('checkAccessibility');
});

ipcMain.handle('checkInputMonitoringPermission', async () => {
  return await callNativeBridge('checkInputMonitoring');
});

ipcMain.handle('checkScreenRecordingPermission', async () => {
  return await callNativeBridge('checkScreenRecording');
});

ipcMain.handle('openAccessibilitySettings', () => {
  shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility');
});

ipcMain.handle('openInputMonitoringSettings', () => {
  shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_ListenEvent');
});

ipcMain.handle('openScreenRecordingSettings', () => {
  shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture');
});

ipcMain.handle('savePermissionConfig', (event, config) => {
  savePermissionConfig({
    ...config,
    onboardingCompleted: true
  });
});

ipcMain.handle('closeOnboarding', () => {
  if (onboardingWindow) {
    onboardingWindow.close();
    onboardingWindow = null;
  }
});

// MARK: - Helper Natif Functions
ipcMain.handle('get-focused-text', async () => {
  return new Promise((resolve) => {
    const helperPath = path.join(__dirname, 'bin', 'StyloHelper');
    
    exec(`"${helperPath}" getFocusedText`, (error, stdout, stderr) => {
      if (error) {
        console.error('Helper error:', error);
        resolve({ success: false, error: error.message, errorCode: 'helper_error' });
        return;
      }
      
      try {
        const result = JSON.parse(stdout.trim());
        resolve(result);
      } catch (parseError) {
        console.error('Helper parse error:', parseError);
        resolve({ success: false, error: 'Failed to parse helper response', errorCode: 'parse_error' });
      }
    });
  });
});

ipcMain.handle('set-focused-text', async (event, text) => {
  return new Promise((resolve) => {
    const helperPath = path.join(__dirname, 'bin', 'StyloHelper');
    const escapedText = text.replace(/"/g, '\\"');
    
    exec(`"${helperPath}" setFocusedText "${escapedText}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('Helper error:', error);
        resolve({ success: false, error: error.message, errorCode: 'helper_error' });
        return;
      }
      
      try {
        const result = JSON.parse(stdout.trim());
        resolve(result);
      } catch (parseError) {
        console.error('Helper parse error:', parseError);
        resolve({ success: false, error: 'Failed to parse helper response', errorCode: 'parse_error' });
      }
    });
  });
});

ipcMain.handle('check-permissions', async () => {
  return new Promise((resolve) => {
    const helperPath = path.join(__dirname, 'bin', 'StyloHelper');
    
    exec(`"${helperPath}" checkPermissions`, (error, stdout, stderr) => {
      if (error) {
        console.error('Helper error:', error);
        resolve({ success: false, error: error.message, errorCode: 'helper_error' });
        return;
      }
      
      try {
        const result = JSON.parse(stdout.trim());
        resolve(result);
      } catch (parseError) {
        console.error('Helper parse error:', parseError);
        resolve({ success: false, error: 'Failed to parse helper response', errorCode: 'parse_error' });
      }
    });
  });
});

// MARK: - Error Popup Window
function createErrorPopup(errorData) {
  if (errorPopupWindow) {
    errorPopupWindow.close();
  }

  errorPopupWindow = new BrowserWindow({
    width: 800,
    height: 600,
    center: true,
    resizable: true,
    minimizable: true,
    closable: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  errorPopupWindow.loadFile('error-popup.html');
  
  errorPopupWindow.webContents.on('did-finish-load', () => {
    errorPopupWindow.webContents.send('error-data', errorData);
  });

  errorPopupWindow.on('closed', () => {
    errorPopupWindow = null;
  });
}

// MARK: - IPC Handlers for Error Popup
ipcMain.handle('show-error-popup', (event, errorData) => {
  createErrorPopup(errorData);
});

ipcMain.handle('close-error-popup', () => {
  if (errorPopupWindow) {
    errorPopupWindow.close();
  }
});

ipcMain.handle('retry-action', () => {
  if (mainWindow) {
    mainWindow.webContents.send('retry-enhancement');
  }
  if (errorPopupWindow) {
    errorPopupWindow.close();
  }
});

ipcMain.handle('copy-logs', (event, logs) => {
  if (logs && typeof logs === 'string') {
    clipboard.writeText(logs);
  } else if (logs && typeof logs === 'object') {
    clipboard.writeText(JSON.stringify(logs, null, 2));
  } else {
    clipboard.writeText('No logs available');
  }
  return true;
});

// MARK: - AX Helper Functions
ipcMain.handle('ax-get-focused-text', async () => {
  return new Promise((resolve) => {
    const helperPath = path.join(__dirname, 'bin', 'StyloAXHelper');
    
    exec(`"${helperPath}" getFocusedText`, (error, stdout, stderr) => {
      if (error) {
        resolve({ ok: false, errorCode: 'HELPER_ERROR', errorMessage: error.message });
        return;
      }
      
      try {
        const result = JSON.parse(stdout.trim());
        resolve(result);
      } catch (parseError) {
        resolve({ ok: false, errorCode: 'PARSE_ERROR', errorMessage: 'Failed to parse helper response' });
      }
    });
  });
});

ipcMain.handle('ax-set-focused-text', async (event, text) => {
  return new Promise((resolve) => {
    const helperPath = path.join(__dirname, 'bin', 'StyloAXHelper');
    const escapedText = text.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    
    exec(`"${helperPath}" setFocusedText "${escapedText}"`, (error, stdout, stderr) => {
      if (error) {
        resolve({ ok: false, errorCode: 'HELPER_ERROR', errorMessage: error.message });
        return;
      }
      
      try {
        const result = JSON.parse(stdout.trim());
        resolve(result);
      } catch (parseError) {
        resolve({ ok: false, errorCode: 'PARSE_ERROR', errorMessage: 'Failed to parse helper response' });
      }
    });
  });
});

// Application event management
app.whenReady().then(() => {
  loadPermissionConfig();
  
  // Lancer directement l'application (onboarding supprimé)
  createWindow();
});

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
