const { ipcRenderer } = require('electron');

// 백엔드로 메시지 전송
ipcRenderer.send('message-from-renderer', 'Hello from renderer process!');

// 메인 프로세스로부터 응답 수신
ipcRenderer.on('message-from-main', (event, arg) => {
  console.log('Response from main process:', arg);
});