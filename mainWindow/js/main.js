// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('node:path')
const os = require('node:os');
const fs = require('node:fs');
const dirTree = require('directory-tree');
const { homedir } = require('node:os');

// require('electron-reload')(path.join(__dirname, '../../**/*'), {
//   electron: path.join(__dirname, '../../node_modules', '.bin', 'electron'),
// });

async function createApplicationWindows() {
  // this window offsetting does not work as intended
  // const windowOffset = 50;
  // const lastWindow = BrowserWindow.getAllWindows().pop();
  // let x, y;

  // if (lastWindow) {
  //   const lastWindowBounds = lastWindow.getBounds();
  //   x = lastWindowBounds.x + windowOffset;
  //   y = lastWindowBounds.y + windowOffset;
  // }

  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    resizable: false,
    autoHideMenuBar: true,
    frame: false,
    show: false,
    // x: x,
    // y: y,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      // transparent: true // this does nothing?
      // backgroundThrottling: false // not sure if this is needed
      // devTools: false
    }
  })


  const splashScreen = new BrowserWindow({
    width: 1040,
    height: 700,
    resizable: false,
    autoHideMenuBar: true,
    frame: false,
    show: false,
    parent: mainWindow,
    webPreferences: {
      preload: path.join(__dirname, '../../splashScreen/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      // sandbox: false,
      // devTools: false
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile('./mainWindow/main.html')
  splashScreen.loadFile('./splashScreen/splash.html')

  // show the window only when it is ready to be shown to prevent jittering
  splashScreen.on('ready-to-show',
    splashScreen.show,
  );

  // mainWindow.on('ready-to-show', mainWindow.show);

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
        // CHANGER mainWindow.destroy() À UTILISER LE PROTOCOL ipcMain.on('app/close') POUR FERMER LA FENÊTRE
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

  ipcMain.on('new-project', (event, arg) => {
    splashScreen.destroy();
    setTimeout(() => { mainWindow.show(); }, 1000);
  });

  // event handlers for the window buttons
  ipcMain.on('app/minimize', (event, arg) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window.minimize();
  });

  ipcMain.on('app/close', (event, arg) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window.close();
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
/*ipcMain.handle('open-new-window', async (event, arg) => {
  createApplicationWindows();
}); */

ipcMain.on('read-file', (event, filePath) => {
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.error('Failed to read file:', err);
      return;
    }
    const fileName = path.basename(filePath);
    event.sender.send('file-content', fileName, data);
    console.log('File content sent to renderer process');
  });
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createApplicationWindows()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createApplicationWindows()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})