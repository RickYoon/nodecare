// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

var cron = require('node-cron');
const { contextBridge, ipcRenderer } = require('electron');
const path = require('path')
const fs = require('fs');
const os = require('os');
const axios = require('axios');
const { exec } = require('child_process');


contextBridge.exposeInMainWorld('electron',{
  homeDir: ()=>os.homedir(),
  osVersion: ()=>os.version(),
  arch: ()=> nodeDataUpdater(),
  sendData: ()=> sendData()
})

function sendData() {

  const inputData = document.getElementById('inputData').value;
  // console.log("input", inputData)

  // 사용자 입력을 메인 프로세스로 전송
  ipcRenderer.send('message-from-renderer', inputData);

}

// 메인 프로세스로부터 응답 수신
ipcRenderer.on('response-from-server', (event, arg) => {
  console.log('Response from server:', arg);
});


const checkDockerStatus = () => {
  return new Promise((resolve, reject) => {
    exec('docker ps', (error, stdout, stderr) => {
      if (error) {
        reject(`Error checking Docker status: ${stderr || error}`);
      } else {
        resolve(stdout);
      }
    });
  });
};



// const logFilePath = "/Users/iloyoon/renderer.log"
// const homeDir = os.homedir()
// console.log("homeDir", homeDir)
// const logFilePath = "C:\\Users\\yoon1\\AppData\\Roaming\\Pi Network\\logs\\renderer.log"

const homeDir = os.homedir()
const logFilePath = homeDir + "\\AppData\\Roaming\\Pi Network\\logs\\renderer.log"

cron.schedule('*/5 * * * *', () => {

    updateNodeState()

});

function updateNodeState () {

  const lines = fs.readFileSync(logFilePath, 'utf8').split('\n');

  let logEntry = ''; // 현재 로그 항목을 누적하는 변수
  let insideSCPLines = false; // "SCP info" 메시지 내부에 있는지 여부를 추적
  let lastLog = [];

  for (const line of lines) {

    if (insideSCPLines) {

      logEntry += line + '\n';

      if (line.includes('}')) {

        insideSCPLines = false;

        const correctedJsonString = JSON.stringify(logEntry.split("info: ")[1])
        .replace(/\n|\r|\s*/g, '')

        const final = JSON.parse(correctedJsonString)

        lastLog.push(logEntry)

        logEntry = ''; // 현재 로그 항목 초기화
      }
    } else if (line.includes("SCP info: {")) {
      // "SCP info: {"을 포함하는 줄을 찾으면 "SCP info" 메시지 시작
      logEntry = line + '\n';
      insideSCPLines = true;
    }
  }

  const correctedJsonStringa = ((lastLog[lastLog.length-1].split("info: ")[1])).replace(/(?:\\[rn])+/g, '').replace(/(\s*)/g, '').replace(/'/g, '"').toString()
  const quote = addQuotesToKeys(correctedJsonStringa)
  const jsonTrans = (JSON.parse(quote))


  const currentDateTime = getCurrentDateTime();

  const inputData = document.getElementById('inputData').value;

  if(inputData !== ""){

  let data = JSON.stringify({
      "username": inputData,
      "datetime": currentDateTime,
      "data": {
        "nodeWorks" : {
          "state": jsonTrans.state,
          "protocolVersion": jsonTrans.protocolVersion,
          "latestBlockTime": convertTimestampToDateTime(jsonTrans.latestBlockTime),
          "ledgerNumber": jsonTrans.ledgerNumber,
          "incomingNodes": jsonTrans.incomingNodes,
          "outgoingNodes": jsonTrans.outgoingNodes,
          "latestProtocolVersion": jsonTrans.latestProtocolVersion
        }, 
        "hardware" : {
          "state": jsonTrans.state,
        }
    }
    });

    // console.log("data",data)

      
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://ub9iyz7kk7.execute-api.ap-northeast-2.amazonaws.com/abc/insertmm',
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
      };
      
      axios.request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log(error);
      });

    console.log('running a task every minute');
  }

}

function getCurrentDateTime() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

  return formattedDateTime;
}

function convertTimestampToDateTime(timestamp) {
  const date = new Date(timestamp * 1000); // timestamp는 초 단위이므로 1000을 곱해 밀리초로 변환
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  return formattedDateTime;
}

function nodeDataUpdater () {

  let result ;

  const lines = fs.readFileSync(logFilePath, 'utf8').split('\n');

  let logEntry = ''; // 현재 로그 항목을 누적하는 변수
  let insideSCPLines = false; // "SCP info" 메시지 내부에 있는지 여부를 추적
  let lastLog = [];

  for (const line of lines) {

    if (insideSCPLines) {

      logEntry += line + '\n';

      if (line.includes('}')) {

        insideSCPLines = false;

        const correctedJsonString = JSON.stringify(logEntry.split("info: ")[1])
        .replace(/\n|\r|\s*/g, '')

        const final = JSON.parse(correctedJsonString)

        lastLog.push(logEntry)

        logEntry = ''; // 현재 로그 항목 초기화
      }
    } else if (line.includes("SCP info: {")) {
      // "SCP info: {"을 포함하는 줄을 찾으면 "SCP info" 메시지 시작
      logEntry = line + '\n';
      insideSCPLines = true;
    }
  }

  const correctedJsonStringa = ((lastLog[lastLog.length-1].split("info: ")[1])).replace(/(?:\\[rn])+/g, '').replace(/(\s*)/g, '').replace(/'/g, '"').toString()
  const quote = addQuotesToKeys(correctedJsonStringa)
  const jsonTrans = (JSON.parse(quote))

  return jsonTrans
  // return correctedJsonStringa

}

function addQuotesToKeys(text) {
  // 정규 표현식을 사용하여 키와 값을 분리
  const regex = /{([^}]+)}/g;
  const result = text.replace(regex, (match, group) => {
    const updatedGroup = group.replace(/(\w+):/g, '"$1":');
    return `{${updatedGroup}}`;
  });

  return result;
}

