const { app, BrowserWindow, dialog } = require('electron');

const fs = require('fs');

const getFileFromUser = exports.getFileFromUser = () => {
    dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
            { name: 'Text Files', extensions: ['txt'] },
            { name: 'Markdown Files', extensions: ['md', 'markdown'] }
        ]
    }).then(result => {
        const file = result.filePaths[0];
        const content = fs.readFileSync(file).toString();
        mainWindow.webContents.send('file-opened', file, content);
    }).catch(err => {
        console.log(err)
    });

}

let mainWindow;

const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        title: "Note taking app",
        width: 800,
        height: 600,
        resizable: true,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    })

    mainWindow.loadURL(`file://${__dirname}/app/index.html`)
}

app.on('ready', () => {
    createMainWindow();

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        // getFileFromUser();

    })

    mainWindow.on('closed', () => {
        mainWindow = null;
    })
});


