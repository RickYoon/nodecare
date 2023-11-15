const { exec } = require('child_process');

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
  

// 사용 예시
checkDockerStatus()
.then((result) => {
  console.log('Docker Status:');
  console.log(result);
})
.catch((err) => {
  console.error(err);
});