const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('overlayAPI', {
  onRender: (cb) => ipcRenderer.on('render-answer', (_, data) => cb(data)),
  onFadeOut: (cb) => ipcRenderer.on('fade-out', () => cb())
});
