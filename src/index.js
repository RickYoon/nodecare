const {app, BrowserWindow, ipcMain} = require('electron')
const url = require('url')
const path = require('path')

function createMainWindow() {

  const mainWindow = new BrowserWindow({
    title:'nodecare',
    width: 600,
    height: 600,
    webPreferences:{
      contextIsolation:true,
      nodeIntegration:true,
      preload: path.join(__dirname, './preload.js'),
    }
  });

  mainWindow.webContents.openDevTools();

  // const startUrl = url.format({
  //   pathname:path.join(__dirname, './app/build/index.html'),
  //   protocol:'file',
  // })
  // mainWindow.loadURL(startUrl)

  const startUrl = url.format({
    pathname:path.join(__dirname, 'index.html'),
    protocol:'file',
  })
  mainWindow.loadURL(startUrl)

  // 렌더러 프로세스로부터 메시지 수신
  ipcMain.on('message-from-renderer', (event, arg) => {
    console.log('Message from renderer:', arg);

    // 메시지에 응답
    event.reply('message-from-main', 'Message received in the main process!');
  });

  // mainWindow.loadURL('http://localhost:3000')

}

app.whenReady().then(createMainWindow);

app.on('window-all-closed', () => {
  // if (process.platform !== 'darwin') {
  //   app.quit();
  // }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

