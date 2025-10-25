const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Get clipboard text
  getClipboardText: () => ipcRenderer.invoke('get-clipboard-text'),
  
  // Set clipboard text
  setClipboardText: (text) => ipcRenderer.invoke('set-clipboard-text', text),
  
  // Copy selected text (simulates Cmd+C)
  copySelectedText: () => ipcRenderer.invoke('copy-selected-text'),
  
  // Paste text (simulates Cmd+V)
  pasteText: (text) => ipcRenderer.invoke('paste-text', text),
  
// NOUVELLES FONCTIONS : Détection automatique
// Get active text field content
getActiveTextField: () => ipcRenderer.invoke('get-active-text-field'),

// Replace text in active text field
replaceActiveTextField: (text) => ipcRenderer.invoke('replace-active-text-field', text),

// NOUVELLES FONCTIONS : Gestion du focus et du flux complet
// Remember the frontmost app
rememberFrontmostApp: () => ipcRenderer.invoke('remember-frontmost-app'),

// Reactivate the remembered frontmost app
reactivateFrontmostApp: () => ipcRenderer.invoke('reactivate-frontmost-app'),

// Select and copy text from focused input
selectAndCopyFocusedText: () => ipcRenderer.invoke('select-and-copy-focused-text'),

// Paste text to focused input
pasteToFocusedInput: (text) => ipcRenderer.invoke('paste-to-focused-input', text),

// Check accessibility permissions
checkAccessibilityPermissions: () => ipcRenderer.invoke('check-accessibility-permissions'),

// NOUVELLES FONCTIONS : Onboarding et Permissions
// Check all permissions
checkAllPermissions: () => ipcRenderer.invoke('checkAllPermissions'),

// Check individual permissions
checkAccessibilityPermission: () => ipcRenderer.invoke('checkAccessibilityPermission'),
checkInputMonitoringPermission: () => ipcRenderer.invoke('checkInputMonitoringPermission'),
checkScreenRecordingPermission: () => ipcRenderer.invoke('checkScreenRecordingPermission'),

// Open system settings
openAccessibilitySettings: () => ipcRenderer.invoke('openAccessibilitySettings'),
openInputMonitoringSettings: () => ipcRenderer.invoke('openInputMonitoringSettings'),
openScreenRecordingSettings: () => ipcRenderer.invoke('openScreenRecordingSettings'),

// Save permission config
savePermissionConfig: (config) => ipcRenderer.invoke('savePermissionConfig', config),

// Close onboarding
closeOnboarding: () => ipcRenderer.invoke('closeOnboarding'),

// AX Helper functions
axGetFocusedText: () => ipcRenderer.invoke('ax-get-focused-text'),
axSetFocusedText: (text) => ipcRenderer.invoke('ax-set-focused-text', text),

// Error popup functions
showErrorPopup: (errorData) => ipcRenderer.invoke('show-error-popup', errorData),
closeErrorPopup: () => ipcRenderer.invoke('close-error-popup'),
retryAction: () => ipcRenderer.invoke('retry-action'),
copyLogs: (logs) => ipcRenderer.invoke('copy-logs', logs),

// Error popup listeners
onErrorData: (callback) => ipcRenderer.on('error-data', (event, data) => callback(data)),
onRetryEnhancement: (callback) => ipcRenderer.on('retry-enhancement', () => callback()),

// Provider change listener
onProviderChanged: (callback) => ipcRenderer.on('provider-changed', (event, data) => callback(data))
});

console.log('✅ Preload script loaded - electronAPI ready');

