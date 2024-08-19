// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('node:path')
const os = require('node:os');
const fs = require('node:fs');
const dirTree = require('directory-tree');
const { homedir } = require('node:os');

require('electron-reload')(path.join(__dirname, '**/*'), {
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
});

async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    resizable: false,
    autoHideMenuBar: true,
    frame: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      transparent: true // this does nothing?
      // backgroundThrottling: false // not sure if this is needed
      // devTools: false
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // show the window only when it is ready to be shown to prevent jittering
  mainWindow.on('ready-to-show', mainWindow.show);

  // Open the DevTools programatically
  // mainWindow.webContents.openDevTools()

  // event handlers for the window buttons
  ipcMain.on('app/minimize', (event, arg) => {
    mainWindow.minimize();
  });

  ipcMain.on('app/close', (event, arg) => {
    app.quit();
  });

  // TO IMPLEMENT: MAKE MAXIMEMISE BUTTON TOGGLE BETWEEN MAXIMISE AND NORMAL SIZE
  // ipcMain.on('app/maximize', (event, arg) => {
  //   if (mainWindow.isMaximized()) {
  //     mainWindow.unmaximize();
  //   } else {
  //     mainWindow.maximize();
  //   }
  // });
}

ipcMain.handle('open-folder-dialog', async (event, arg) => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  return result;
});

ipcMain.handle('get-dir-tree', async (event, folderPath) => {
  if (folderPath) {
    return dirTree(folderPath);
  }
});

// const tree = dirTree(path.join(homedir(), 'Téléchargements'));
// console.log(tree);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.