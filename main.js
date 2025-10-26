const { app, BrowserWindow, screen, clipboard, globalShortcut, ipcMain, shell, Menu, Tray, nativeImage } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

// Set the app name to "Stylo" - MUST be called before app.whenReady()
app.setName('Stylo');

// Also set the process title for macOS menu bar
process.title = 'Stylo';

// GPU acceleration enabled for better performance

let mainWindow;
let tray = null;
let onboardingWindow = null;
let errorPopupWindow = null;
let frontmostAppBundleId = null;
let permissionConfig = null;
let dragStart = null;
let isDragging = false;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  // Create the floating window - MACOS DOCK PERSISTENT CONFIGURATION
  mainWindow = new BrowserWindow({
    width: 200,
    height: 50,
    x: Math.round((width - 200) / 2), // Center horizontally
    y: 50, // Position at the top
    frame: false, // No title bar
    transparent: false, // Disable transparency to prevent GPU errors and dock disappearing
    alwaysOnTop: false, // Disable alwaysOnTop to maintain dock presence
    skipTaskbar: false, // Show in dock
    resizable: false,
    focusable: true, // Allow focus to maintain dock presence
    show: false, // Don't show until ready
    minimizable: true, // Allow minimizing to dock
    closable: true, // Allow closing
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the interface
  mainWindow.loadFile('index.html');

  // Show window when ready to maintain dock presence
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Ensure app stays in dock
    app.focus();
    // Set alwaysOnTop AFTER showing to maintain dock presence
    setTimeout(() => {
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
    }, 100);
  });

  // Allow focus and interaction
  mainWindow.setFocusable(true);
  mainWindow.setIgnoreMouseEvents(false);
  
  // Ensure window is draggable
  mainWindow.setMovable(true);
  
  // Force enable dragging
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      // Ensure drag regions are properly set
      const draggableArea = document.querySelector('.draggable-area');
      if (draggableArea) {
        draggableArea.style.webkitAppRegion = 'drag';
        console.log('✅ Drag region enabled');
      }
    `);
  });

  // Create tray icon for easy access
  createTray();
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  
  // Open DevTools in development mode
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  // Use CSS-based drag regions only; no programmatic dragging
}

// MARK: - Menu Configuration
function createMenu() {
  // Charger la config actuelle
  const configPath = path.join(__dirname, 'config.js');
  let config = fs.readFileSync(configPath, 'utf8');
  
  // Fonction pour extraire le provider actuel
  const getProvider = () => {
    const regex = /default:\s*'(\w+)'/;
    const match = config.match(regex);
    return match ? match[1] : 'openrouter';
  };
  
  const currentProvider = getProvider();
  
  const template = [
    {
      label: 'Stylo',
      submenu: [
        {
          label: 'About Stylo',
          role: 'about'
        },
        { type: 'separator' },
        {
          label: 'Quit Stylo',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'Provider',
      submenu: [
        {
          label: `LettA AI ${currentProvider === 'letta' ? '✓' : ''}`,
          type: 'radio',
          checked: currentProvider === 'letta',
          click: () => updateProvider('default', 'letta')
        },
        {
          label: `OpenRouter (Llama 3.3) ${currentProvider === 'openrouter' ? '✓' : ''}`,
          type: 'radio',
          checked: currentProvider === 'openrouter',
          click: () => updateProvider('default', 'openrouter')
        },
        {
          label: `OpenAI (GPT-4o-mini) ${currentProvider === 'openai' ? '✓' : ''}`,
          type: 'radio',
          checked: currentProvider === 'openai',
          click: () => updateProvider('default', 'openai')
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' }
      ]
    }
  ];
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createTray() {
  // Create a simple tray icon
  const iconPath = path.join(__dirname, 'icone', 'pen-tool-plus.svg');
  const trayIcon = nativeImage.createFromPath(iconPath);
  
  tray = new Tray(trayIcon.resize({ width: 16, height: 16 }));
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Stylo',
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'Show/Hide',
      click: () => {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Configuration',
      submenu: [
        {
          label: 'LettA AI',
          type: 'radio',
          checked: true,
          click: () => {
            // Switch to LettA provider
            console.log('Switched to LettA AI');
          }
        },
        {
          label: 'OpenAI',
          type: 'radio',
          click: () => {
            // Switch to OpenAI provider
            console.log('Switched to OpenAI');
          }
        },
        {
          label: 'OpenRouter',
          type: 'radio',
          click: () => {
            // Switch to OpenRouter provider
            console.log('Switched to OpenRouter');
          }
        }
      ]
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);
  
  tray.setContextMenu(contextMenu);
  tray.setToolTip('Stylo - Floating Text Assistant');
}

// Fonction pour mettre à jour le provider dans config.js
function updateProvider(buttonName, provider) {
  const configPath = path.join(__dirname, 'config.js');
  let config = fs.readFileSync(configPath, 'utf8');
  
  // Remplacer le provider par défaut
  const regex = new RegExp(`(default:\\s*)'\\w+'`, 'g');
  config = config.replace(regex, `$1'${provider}'`);
  
  // Sauvegarder
  fs.writeFileSync(configPath, config, 'utf8');
  
  console.log(`✅ Provider changed: ${buttonName} → ${provider}`);
  console.log('🔄 Restarting app to apply changes...');
  
  // REDÉMARRER L'APP COMPLÈTEMENT
  app.relaunch();
  app.exit(0);
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

// MARK: - IPC Handlers Setup
function setupIpcHandlers() {
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
            
            resolve(true);
          });
        }, 200);
      });
    });
  });

  // Remember frontmost app
  ipcMain.handle('remember-frontmost-app', async () => {
    return new Promise((resolve) => {
      exec('osascript -e \'tell application "System Events" to get bundle identifier of first application process whose frontmost is true\'', (error, stdout) => {
        if (error) {
          console.error('Error getting frontmost app:', error);
          resolve(false);
          return;
        }
        
        frontmostAppBundleId = stdout.trim();
        console.log('📱 Remembered frontmost app:', frontmostAppBundleId);
        resolve(true);
      });
    });
  });

  // Reactivate frontmost app
  ipcMain.handle('reactivate-frontmost-app', async () => {
    if (!frontmostAppBundleId) {
      console.warn('⚠️ No frontmost app remembered');
      return false;
    }
    
    return new Promise((resolve) => {
      exec(`osascript -e 'tell application id "${frontmostAppBundleId}" to activate'`, (error) => {
        if (error) {
          console.error('Error reactivating app:', error);
          resolve(false);
          return;
        }
        
        console.log('🔄 Reactivated app:', frontmostAppBundleId);
        resolve(true);
      });
    });
  });

  // Error popup functions
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

  // Window resize handler
  ipcMain.handle('resize-window', async (event, width, height) => {
    if (mainWindow) {
      mainWindow.setSize(width, height);
      console.log(`🖼️  Window resized to: ${width}x${height}`);
      return true;
    }
    return false;
  });
}

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

// Application event management
app.whenReady().then(() => {
  loadPermissionConfig();
  
  // Setup IPC handlers FIRST
  setupIpcHandlers();
  
  // Créer le menu
  createMenu();
  
  // Lancer directement l'application (onboarding supprimé)
  createWindow();
  
  // Force app to stay in dock on macOS
  if (process.platform === 'darwin') {
    app.dock.show();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else {
    // Ensure app stays in dock when activated
    app.focus();
    if (mainWindow) {
      mainWindow.show();
    }
  }
});

// Ensure app stays in dock on macOS
app.on('browser-window-focus', () => {
  app.focus();
});

// Maintain dock presence when window loses focus
app.on('browser-window-blur', () => {
  if (process.platform === 'darwin') {
    // Keep dock visible even when window loses focus
    app.dock.show();
  }
});

// Handle dock clicks to show/hide window
app.on('dock-click', () => {
  if (mainWindow) {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      app.focus();
    }
  }
});

// Prevent app from hiding from dock
app.on('before-quit', () => {
  if (process.platform === 'darwin') {
    app.dock.show();
  }
});

// Handle window dragging - moved inside createWindow function
