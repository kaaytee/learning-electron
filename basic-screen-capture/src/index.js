const { app, BrowserWindow } = require('electron/main')
const path = require('node:path')
require('@electron/remote/main').initialize()

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // i think this is bad
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: true
    }
  })

  require('@electron/remote/main').enable(win.webContents)
  win.loadFile(path.join(__dirname, 'index.html'))
  win.webContents.openDevTools()
}

console.log(path.join(__dirname, 'preload.js'))
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})