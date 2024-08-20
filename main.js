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


async function createApplicationWindow() {
  // this window offsetting does not work as intended
  const windowOffset = 50;
  const lastWindow = BrowserWindow.getAllWindows().pop();
  let x, y;

  if (lastWindow) {
    const lastWindowBounds = lastWindow.getBounds();
    x = lastWindowBounds.x + windowOffset;
    y = lastWindowBounds.y + windowOffset;
  }

  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    resizable: false,
    autoHideMenuBar: true,
    frame: false,
    show: false,
    x: x,
    y: y,
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

  // Handle window close event
  mainWindow.on('close', (event) => {
    event.preventDefault(); // Prevent the window from closing immediately

    // const window = BrowserWindow.fromWebContents(event.sender);

    const options = {
      type: 'question',
      buttons: ['Enregistrer', 'Ne pas enregistrer', 'Annuler'],
      defaultId: 0,
      title: 'Enregistrer les modifications',
      message: 'Voulez-vous enregistrer les modifications apportées à ce projet avant de le fermer?',
      detail: 'Ce projet contient des modifications. Si vous ne sauvegardez pas, elles seront perdues.',
    };

    dialog.showMessageBox(options).then((result) => {
      if (result.response === 0) {
        // handle save logic here
        mainWindow.destroy();
      } else if (result.response === 1) {
        mainWindow.destroy();
      }
    });
  });

  // Handle "Fermer le projet" button click
  ipcMain.handle('close-project', (event) => {
    const options = {
      type: 'question',
      buttons: ['Save', 'Don\'t Save', 'Cancel'],
      defaultId: 0,
      title: 'Save Project',
      message: 'Do you want to save your project before closing?',
      detail: 'Your changes will be lost if you don\'t save them.',
    };

    const result = dialog.showMessageBox(mainWindow, options);
    return result;
  });

  // Open the DevTools programatically
  // mainWindow.webContents.openDevTools()

  // event handlers for the window buttons
  ipcMain.on('app/minimize', (event, arg) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window.minimize();
  });

  ipcMain.on('app/close', (event, arg) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    mainWindow.close();
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

// handle IPC events
ipcMain.handle('open-new-window', async (event, arg) => {
  createApplicationWindow();
});

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
  createApplicationWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createApplicationWindow()
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