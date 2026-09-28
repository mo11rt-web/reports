const { contextBridge, ipcRenderer } = require('electron');

// جسر آمن ومحدود بين واجهة التطبيق والعملية الرئيسية (بدون فتح Node للواجهة)
contextBridge.exposeInMainWorld('desktop', {
  exportWord: (model, suggestedName) => ipcRenderer.invoke('export-word', model, suggestedName),
});
