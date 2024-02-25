import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import {ipcMain} from "electron"
import {ClipboardFormat} from "./libs/clipboard-native";
// eslint-disable-next-line @typescript-eslint/no-var-requires
import {getClipboardData, getClipboardFormats} from "./libs/clipboard-native";

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')


let win: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: true
    },
    // titleBarStyle: "hidden",
    // hasShadow: true,
    // frame: false,
    // titleBarOverlay: {
    //   color: '#2f3241',
    //   symbolColor: '#74b1be',
    //   height: 0,
    // },
    // backgroundMaterial: "acrylic",
    // transparent: true
  })
  // const win2 = new BrowserWindow({})
  win.webContents.openDevTools({mode: 'detach'})
  // const hwnd = win.getNativeWindowHandle()
  // const windowsTitleBar = require('electron-windows-titlebar')
  // console.log(hwnd)
  // console.log(windowsTitleBar);

  // win.setMinimumSize(200, 200)
  // win.setMaximumSize(1600, 1200)

  ipcMain.on('getClipboard', (event) => {
    // const text = clipboard.readText();
    // const image = clipboard.readImage();
    // const bookmark = clipboard.readBookmark();
    // const available = clipboard.availableFormats()
    const available = getClipboardFormats();
    let _t: any = {
      formats: available,
      buffers: Object.fromEntries(available.map((value: ClipboardFormat) => [value.id, getClipboardData(value.id)])),
    }
    _t = {
      ..._t,
      utf8Content: Object.fromEntries(
          Object.entries(_t.buffers).map(([key, value]: [string, Buffer]) => [key, value.toString('utf-8')])
      )
    }
    event.sender.send('clipboardContent', _t)
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL).then(() => {})
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html')).then(() => {})
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
