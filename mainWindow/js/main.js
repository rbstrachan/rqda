// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('node:path')
const os = require('node:os');
const fs = require('node:fs');
const dirTree = require('directory-tree');
const { homedir } = require('node:os');

async function createApplicationWindows() {
	const mainWindow = new BrowserWindow({
		width: 1440,
		height: 900,
		resizable: false,
		autoHideMenuBar: true,
		frame: false,
		show: false,
		transparent: true,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			nodeIntegration: false,
			contextIsolation: true,
			sandbox: false,
			// devTools: false
		}
	})

	const projectScreen = new BrowserWindow({
		width: 1040,
		height: 700,
		resizable: false,
		autoHideMenuBar: true,
		frame: false,
		show: false,
		transparent: true,
		parent: mainWindow,
		webPreferences: {
			preload: path.join(__dirname, '../../projectScreen/preload.js'),
			nodeIntegration: false,
			contextIsolation: true,
			// sandbox: false,
			// devTools: false
		}
	});

	// handle the setup of the application
	// by vreating necessary directories and files for execution
	async function setupApplication() {
		const appDataPath = path.join(app.getPath('documents'), 'QADDOE');
		const projectsPath = path.join(appDataPath, 'projets');
		const codesPath = path.join(appDataPath, 'codes');
		const dotPath = path.join(appDataPath, '.qaddoe');
		const appConfigPath = path.join(dotPath, 'config.json');
		const settingsPath = path.join(dotPath, 'settings.json');

		// create the appData directory if it doesn't exist
		if (!fs.existsSync(appDataPath)) {
			fs.mkdirSync(projectsPath, { recursive: true });
			fs.mkdirSync(codesPath, { recursive: true });
			fs.mkdirSync(dotPath, { recursive: true });
			fs.writeFileSync(appConfigPath, JSON.stringify({}));
			fs.writeFileSync(settingsPath, JSON.stringify({}));
		}

		// show the projectCreen window
		projectScreen.show();
	}

	// and load the index.html of the app, triggering the js files
	projectScreen.loadFile('./projectScreen/project.html')
	mainWindow.loadFile('./mainWindow/main.html')

	// show the window only when it is ready to be shown to prevent jittering
	projectScreen.on('ready-to-show',
		// projectScreen.show
		setupApplication
	);

	// handle window close event
	mainWindow.on('close', (event) => {
		event.preventDefault();

		const options = {
			type: 'question',
			buttons: ['Enregistrer', 'Ne pas enregistrer', 'Annuler'],
			defaultId: 0,
			title: 'Enregistrer les modifications',
			message: 'Voulez-vous enregistrer les modifications apportées à ce projet avant de le fermer?',
			detail: 'Ce projet contient des modifications. Si vous ne les sauvegardez pas, elles seront perdues.',
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

	ipcMain.on('create-new-project', (event, projectName) => {
		// create new project in projects folder with provided project name and its subfolders
		const projectPath = path.join(app.getPath('documents'), 'QADDOE', 'projets', projectName);
		fs.mkdirSync(path.join(projectPath, 'Documents'), { recursive: true });
		fs.mkdirSync(path.join(projectPath, 'Memos'), { recursive: true });
		fs.mkdirSync(path.join(projectPath, 'Notes'), { recursive: true });

		// pass the project path to the mainScreen window
		mainWindow.webContents.send('open-project', projectPath);

		projectScreen.destroy();
		setTimeout(() => { mainWindow.show(); }, 500);
	});

	ipcMain.on('request-open-project', (event, projectPath) => {
		mainWindow.webContents.send('open-project', projectPath);

		projectScreen.destroy();
		setTimeout(() => { mainWindow.show(); }, 500);
	});

	ipcMain.on('request-close-project-screen', (event) => {
		projectScreen.destroy();
		mainWindow.destroy();
	});

	// Open the DevTools programatically
	// mainWindow.webContents.openDevTools()

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
// event handlers for the window buttons
ipcMain.on('app/minimize', (event, arg) => {
	const window = BrowserWindow.fromWebContents(event.sender);
	window.minimize();
});

ipcMain.on('app/close', (event, arg) => {
	const window = BrowserWindow.fromWebContents(event.sender);
	window.close();
});

ipcMain.on('read-file', (event, filePath) => {
	fs.readFile(filePath, 'utf-8', (err, data) => {
		if (err) {
			console.error('Failed to read file:', err);
			return;
		}
		const fileName = path.basename(filePath);
		event.sender.send('file-content', fileName, data, filePath);
	});
});

ipcMain.on('save-file', (event, data) => {
	fs.writeFile(data.filePath, data.content, (err) => {
		if (err) { console.error('Error writing file:', err); }
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

// ipcMain.handle('get-list-of-projects', (event, arg) => {
// 	const projectsDir = path.join(app.getPath('documents'), 'QADDOE', 'projets');
// 	const results = fs.readdirSync(projectsDir);
// 	return results;
// });

ipcMain.handle('get-list-of-projects', (event, arg) => {
	const projectsDir = path.join(app.getPath('documents'), 'QADDOE', 'projets');
	const results = fs.readdirSync(projectsDir).map(project => {
		const projectPath = path.join(projectsDir, project);
		const stats = fs.statSync(projectPath);
		return {
			name: project,
			path: projectPath,
			creationDate: stats.birthtime
		};
	});
	return results;
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