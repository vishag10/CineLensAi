const { app, BrowserWindow, globalShortcut, ipcMain, dialog, Tray, Menu, nativeImage, desktopCapturer, screen } = require('electron');
const path = require('path');
const { execSync } = require('child_process');

let mainWindow;
let tray;

const isDev = !app.isPackaged;
const FRONTEND_URL = isDev ? 'http://localhost:5173' : `file://${path.join(__dirname, '../frontend/dist/index.html')}`;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0F172A',
    titleBarStyle: 'hiddenInset',
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false // Allow local file access for images
    },
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  mainWindow.loadURL(FRONTEND_URL);

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  try {
    const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');
    tray = new Tray(nativeImage.createFromPath(iconPath));
  } catch {
    tray = new Tray(nativeImage.createEmpty());
  }

  const contextMenu = Menu.buildFromTemplate([
    { label: 'CineLens', enabled: false },
    { type: 'separator' },
    { label: 'Open CineLens', click: () => mainWindow?.show() },
    { label: 'Snip Screen (Ctrl+Shift+S)', click: () => captureScreen() },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ]);

  tray.setToolTip('CineLens - Movie Identifier');
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => mainWindow?.show());
}

async function captureScreen() {
  try {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.size;

    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width, height }
    });

    if (sources.length > 0) {
      const thumbnail = sources[0].thumbnail;
      const base64 = thumbnail.toDataURL();
      
      mainWindow?.show();
      mainWindow?.webContents.send('screen-captured', base64);
    }
  } catch (error) {
    console.error('Screen capture failed:', error.message);
  }
}

// IPC Handlers
ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Movie Screenshot',
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'bmp'] }
    ],
    properties: ['openFile']
  });
  
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('capture-screen', async () => {
  await captureScreen();
  return true;
});

ipcMain.handle('minimize-window', () => mainWindow?.minimize());
ipcMain.handle('maximize-window', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize();
  else mainWindow?.maximize();
});
ipcMain.handle('close-window', () => mainWindow?.close());

app.whenReady().then(() => {
  createWindow();
  createTray();

  // Global hotkey: Ctrl+Shift+S for screen snip
  globalShortcut.register('CommandOrControl+Shift+S', () => {
    captureScreen();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
