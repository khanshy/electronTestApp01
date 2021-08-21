// Modules to control application life and create native browser window
const {app, BrowserWindow, dialog} = require('electron');
const { autoUpdater } = require("electron-updater");
const path = require('path');
let main = {};
let splashScreen = {};

function createWindow () {
    // create a splash screen
    splashScreen = new BrowserWindow({
        width: 640,
        height: 400,
        resizable: false,
        show: false,
        frame: false
    });

    // Create the browser window.
    main = new BrowserWindow({
        height: 600,
        minWidth: 800,
        minHeight: 520,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        },
        show: false,
    });

    // load splash-screen of the app.
    splashScreen.loadFile("./assets/screens/splash-screen.html");
    splashScreen.once('ready-to-show', () => {
        splashScreen.show();
        // splashScreen.webContents.openDevTools();
    });

    // load the index.html of the app.
    main.loadFile('index.html');
    main.once('ready-to-show', () => {
        setTimeout(() => {
            splashScreen.close();
            main.show();
        }, 3000);
    });

    // Open the DevTools.
    main.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

setTimeout(() => {
    autoUpdater.checkForUpdates();
    main.webContents.send('update', 'Checking For Updates!');
}, 5000);

autoUpdater.on('update-available', () => {
    main.webContents.send('update', 'Update Available');
});

autoUpdater.on('update-not-available', () => {
    main.webContents.send('update', 'Update Not Available');
});

autoUpdater.on('download-progress', (progress, bytesPerSecond, percent, total, transferred) => {
    main.webContents.send('update', `Download Progress: ${JSON.stringify(progress)}`);
});

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    main.webContents.send('update', 'Update Downloaded');
    const dialogOpts = {
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: 'Application Update',
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail: 'A new version has been downloaded. Restart the application to apply the updates.'
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0) autoUpdater.quitAndInstall();
    });
});

autoUpdater.on('error', message => {
    main.webContents.send('update', message);
});