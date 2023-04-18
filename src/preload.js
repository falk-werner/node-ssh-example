const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('ssh', {
  exec: (host, user, password, command) => ipcRenderer.invoke("exec", host, user, password, command),
  upload: (host, user, password, localFile, remoteFile) => ipcRenderer.invoke("upload", host, user, password, localFile, remoteFile),
})

contextBridge.exposeInMainWorld('dialog', {
  openFile: () => ipcRenderer.invoke("openFile"),
})
