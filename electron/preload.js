const { contextBridge, ipcRenderer } = require('electron');

// Expose safe APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  captureScreen: () => ipcRenderer.invoke('capture-screen'),

  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),

  // Listen for screen capture result
  onScreenCaptured: (callback) => {
    ipcRenderer.on('screen-captured', (event, imageDataUrl) => callback(imageDataUrl));
  },

  // Remove listeners on cleanup
  removeScreenCapturedListener: () => {
    ipcRenderer.removeAllListeners('screen-captured');
  }
});
