const {app, BrowserWindow} = require('electron'),
      path = require('path'),
      url = require('url');

let win;

function createWindow() {
  win = new BrowserWindow ({
    width: 1000,
    height: 1000,
    icon: path.join(__dirname, 'assets/images/icon2.png')
  });

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: "file:",
    slashes: true
  }));

  win.on('closed', () => {
    win = null;
    app.quit();
  });
}

app.on('ready', createWindow);