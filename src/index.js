const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const {NodeSSH} = require('node-ssh')

let g_mainWindow = null;

async function ssh_exec(_, host, user, password, command) {
  const ssh = new NodeSSH();
  await ssh.connect({host: host, username: user, password: password });
  const result = await ssh.execCommand(command, {stream: "both"});
  ssh.dispose();

  return result;
}

async function ssh_upload(_, host, user, password, localFile, remoteFile) {
  const ssh = new NodeSSH();
  await ssh.connect({host: host, username: user, password: password });
  await ssh.putFile(localFile, remoteFile);
  ssh.dispose();
}

async function openFile() {
  return dialog.showOpenDialogSync(g_mainWindow, {
    properties: ['openFile']
  });
}

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  g_mainWindow = mainWindow;

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
   mainWindow.webContents.openDevTools();
};

app.on('ready', () => {
  ipcMain.handle("exec", ssh_exec);
  ipcMain.handle("upload", ssh_upload);
  ipcMain.handle("openFile", openFile);
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
