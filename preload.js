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
  replaceActiveTextField: (text) => ipcRenderer.invoke('replace-active-text-field', text)
});

console.log('✅ Preload script loaded - electronAPI ready');

