import {app, BrowserWindow, ipcMain, clipboard} from 'electron'
import path from 'node:path'
import type {ClipboardFormat} from "./libs/clipboard-native"
// import {} from "./libs/clipboard-native";
const {getClipboardData, getClipboardFormats, ansi2utf8, onClipboardUpdate} = require("./libs/clipboard-native");

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
        // hasShadow: false,
        hasShadow: true,
        frame: false,
        width: 800,
        height: 600,
        resizable: false,
        // titleBarOverlay: {
        //   color: '#2f3241',
        //   symbolColor: '#74b1be',
        //   height: 0,
        // },

        // backgroundMaterial: "acrylic",
        // vibrancy: "selection",
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

    // clipboard.

    ipcMain.on('getClipboard', (event) => {
        // console.log(path.resolve('./'))
        const available = getClipboardFormats();
        let _t: any = {
            formats: available,
            buffers: Object.fromEntries(available.map((value: ClipboardFormat) => [value.id, getClipboardData(value.id)])),
        }
        // _t = {
        //   ..._t,
        //   // utf8Content: Object.fromEntries(
        //   //     Object.entries(_t.buffers).map(([key, value]: [string, Buffer]) => [key, value.toString('utf-8')])
        //   // )
        // }
        event.sender.send('clipboardContent', _t)
        // event.sender.send('clipboardContent', {'cp': 'unavailable'})
    })

    ipcMain.on('ansi2utf8', (event, b: Uint8Array) => {
        event.sender.send('ansi2utf8Callback', ansi2utf8(b))
    })

    ipcMain.on('readUtf16', (event, u8a: Uint8Array) => {
        const b = Buffer.from(u8a)
        let s = b.toString('utf-16le')
        if (s.at(-1) === '\0') {
            s = s.slice(0, -1)
        }
        event.sender.send('readUtf16Callback', s)
    })

    onClipboardUpdate(() => {
        // console.log('teistno')
        // just send a clipboard update event
        win?.webContents.send('clipboardContent', (() => {
            const available = getClipboardFormats();
            console.log(available)
            let _t: any = {
                formats: available,
                buffers: Object.fromEntries(available.map((value: ClipboardFormat) => [value.id, getClipboardData(value.id)])),
            }
            return _t
        })())
    })

    // Test active push message to Renderer-process.
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', (new Date).toLocaleString())
    })

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL).then(() => {
        })
    } else {
        // win.loadFile('dist/index.html')
        win.loadFile(path.join(process.env.DIST, 'index.html')).then(() => {
        })
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
