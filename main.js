const { app, BrowserWindow } = require('electron');

function createWindow () {
    const win = new BrowserWindow({
      width: 1600,
      height: 1200
    })
  
    win.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow()
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
});