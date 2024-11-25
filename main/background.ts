import path from 'path';
import { app, ipcMain } from 'electron';
import { spawn } from 'child_process';
import serve from 'electron-serve';
import { createWindow } from './helpers';

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

let exeProcess;

async function startExeScript() {
  // ระบุตำแหน่งไฟล์ .exe
  const exePath = isProd
    ? path.join(process.resourcesPath, 'API', 'websocketconnect.exe') // Production
    : path.join(__dirname, '../API/websocketconnect.exe'); // Development

  console.log(`Executable Path: ${exePath}`); // ตรวจสอบ path

  exeProcess = spawn(exePath);

  exeProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  exeProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  exeProcess.on('close', (code) => {
    console.log(`Executable process exited with code ${code}`);
  });
}

async function startExesocketScript() {
  // ระบุตำแหน่งไฟล์ .exe
  const exePath = isProd
    ? path.join(process.resourcesPath, 'API', 'socketapi.exe') // Production
    : path.join(__dirname, '../API/socketapi.exe'); // Development

  console.log(`Executable Path: ${exePath}`); // ตรวจสอบ path

  exeProcess = spawn(exePath);

  exeProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  exeProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  exeProcess.on('close', (code) => {
    console.log(`Executable process exited with code ${code}`);
  });
}

async function startExeAIScript() {
  // ระบุตำแหน่งไฟล์ .exe
  const exePath = isProd
    ? path.join(process.resourcesPath, 'API', 'AI.exe') // Production
    : path.join(__dirname, '../API/AI.exe'); // Development

  console.log(`Executable Path: ${exePath}`); // ตรวจสอบ path

  exeProcess = spawn(exePath);

  exeProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  exeProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  exeProcess.on('close', (code) => {
    console.log(`Executable process exited with code ${code}`);
  });
}


let mainWindow;
(async () => {
  await app.whenReady();

  // เรียกใช้งาน .exe แทน Python script
  startExeScript();
  // startExeAIScript();
  startExesocketScript();

  mainWindow = createWindow('main', {
    width: 1920,
    height: 1080,
    frame: false,
    title: 'GCS - Getsure Control System',
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
  if (exeProcess) {
    exeProcess.kill('SIGTERM'); // หยุดการทำงานของ .exe
  }
  app.quit();
});

ipcMain.on('close-app', () => {
  if (exeProcess) {
    exeProcess.kill('SIGTERM'); // หยุดการทำงานของ .exe
  }
  app.quit();
});

ipcMain.on('open-devtools', () => {
  if (mainWindow) {
    mainWindow.webContents.openDevTools();
  }
});

ipcMain.on('message', async (event, arg) => {
  event.reply('message', `${arg} World!`);
});
