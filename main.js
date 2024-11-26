const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const log = require('electron-log');

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: true, // Required for dialog
        },
    });

    // Load your React app
    mainWindow.loadURL('http://localhost:3000'); // Assuming React runs on localhost:3000
    log.info('Window created');
});

const { ipcMain } = require('electron');

ipcMain.handle('dialog:openDirectory', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
    });
    return result.filePaths[0]; // Return the selected directory
});
