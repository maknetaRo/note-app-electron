const { app, BrowserWindow, dialog } = require('electron');

const fs = require('fs');
const windows = new Set();


const createWindow = exports.createWindow = () => {
    let x, y;

    const currentWindow = BrowserWindow.getFocusedWindow();

    if (currentWindow) {
        const [currentWindowX, currentWindowY] = currentWindow.getPosition();
        x = currentWindowX + 15;
        y = currentWindowY + 15;
    }

    let newWindow = new BrowserWindow({
        x, y,
        width: 800,
        height: 600,
        resizable: true,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });

    newWindow.loadURL(`file://${__dirname}/app/index.html`)
    newWindow.once('ready-to-show', () => {
        newWindow.show();
    });

    newWindow.on('closed', () => {
        windows.delete(newWindow);
        newWindow = null;
    });

    windows.add(newWindow);
    return newWindow;
};
app.on('window-all-clsed', () => {
    if (process.platform === 'darwin') {
        return false;
    }
    app.quit();
});

app.on('ready', () => {
    createWindow();
});

app.on('activate', (event, hasVisibleWindows) => {
    if (!hasVisibleWindows) { createWindow(); }
})


app.on('will-finish-launching', () => {
    app.on('open-file', (event, file) => {
        const win = createWindow();
        win.once('ready-to-show', () => {
            openFile(win, file);
        });
    });
});


const getFileFromUser = exports.getFileFromUser = (targetWindow) => {
    dialog.showOpenDialog(targetWindow, {
        properties: ['openFile'],
        filters: [
            { name: 'Text Files', extensions: ['txt'] },
            { name: 'Markdown Files', extensions: ['md', 'markdown'] }
        ]
    }).then(result => {

        const file = result.filePaths[0];
        const content = fs.readFileSync(file).toString();
        app.addRecentDocument(file);
        targetWindow.setRepresentedFilename(file);
        targetWindow.webContents.send('file-opened', file, content);
    }).catch(err => {
        console.log(err)
    });

}

const saveHtml = exports.saveHtml = (targetWindow, content) => {
    dialog.showSaveDialog(targetWindow, {
        title: 'Save HTML',
        defaultPath: app.getPath('documents'),
        filters: [
            {
                name: 'HTML Files', extensions: ['html', 'htm']
            }
        ]
    }).then(result => {
        const filePath = result.filePath;
        console.log(result)
        console.log(filePath)
        console.log(content)
        fs.writeFileSync(filePath, content);
    }).catch(error => {
        console.log(error);
    });

};


const saveMarkdown = exports.saveMarkdown = (targetWindow, file, content) => {
    dialog.showSaveDialog(targetWindow, {
        title: "Save Markdown",
        defaultPath: app.getPath('documents'),
        filters: [
            { name: 'Markdown', extensions: ['md', 'markdown'] }
        ]
    }).then(result => {
        // const file = result.filePath;
        fs.writeFileSync(file, content);
        // openFile(targetWindow, file);
    }).catch(error => {
        console.log(error);
    })
}