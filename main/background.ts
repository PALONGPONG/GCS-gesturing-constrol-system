

import path from 'path';
import { app, ipcMain } from 'electron';
import { exec } from 'child_process';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import { spawn } from 'child_process';
const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

let pythonProcess;

async function startPythonScript() {
  // ระบุตำแหน่งของไฟล์ test_socket.py โดยใช้ app.getAppPath() ใน production
  const scriptPath = isProd
  ? path.join(process.resourcesPath, 'API', 'test_socket.py')  // ใช้ resourcesPath สำหรับ production
  : path.join(__dirname, '../API/test_socket.py');  // สำหรับ development

console.log(`Script Path: ${scriptPath}`);  // ลองตรวจสอบว่า path ถูกต้องหรือไม่

pythonProcess = spawn('python', [scriptPath]);

pythonProcess.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

pythonProcess.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

pythonProcess.on('close', (code) => {
  console.log(`Python process exited with code ${code}`);
});
}
async function startcamera() {
  // ระบุตำแหน่งของไฟล์ test_socket.py โดยใช้ app.getAppPath() ใน production
  const scriptPath = isProd
  ? path.join(process.resourcesPath, 'API', 'camera.py')  // ใช้ resourcesPath สำหรับ production
  : path.join(__dirname, '../API/camera.py');  // สำหรับ development

console.log(`Script Path: ${scriptPath}`);  // ลองตรวจสอบว่า path ถูกต้องหรือไม่

pythonProcess = spawn('python', [scriptPath]);

pythonProcess.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

pythonProcess.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

pythonProcess.on('close', (code) => {
  console.log(`Python process exited with code ${code}`);
});
}

; (async () => {
  await app.whenReady();

  // รันสคริปต์ Python
  startPythonScript();
  // startcamera();
  const mainWindow = createWindow('main', {
    // fullscreen: true,  // เปิดแอปในโหมด fullscreen
    width: 1000,
    height: 600,
    // frame: false,  // ปิดแถบเครื่องมือ
    title: 'GCS - Getsure Control System',  // ตั้งชื่อแอปใหม่ที่นี่
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isProd) {
    await mainWindow.loadURL('app://./home');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }
})();

app.on('window-all-closed', () => {
  if (pythonProcess) {
    pythonProcess.kill('SIGTERM'); // เปลี่ยนเป็น SIGTERM เพื่อให้มั่นใจว่าโปรเซสจะหยุดทำงาน

  }
  app.quit();
});


ipcMain.on('message', async (event, arg) => {
  event.reply('message', `${arg} World!`);
});
