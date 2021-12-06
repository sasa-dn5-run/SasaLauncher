import path from 'path'
import { app, BrowserWindow } from 'electron'
import log from 'electron-log'
import { API } from '../api'
import { Constants } from './Constants'
import { DevServer } from './dev/server'
import { Logger } from './util/Logger'

export class MainApp {
    public static isDev = process.env.NODE_ENV === 'development'

    private readonly API: API

    public static run() {
        new MainApp()
    }

    private _MainWindow?: BrowserWindow
    public get MainWindow() {
        return this._MainWindow
    }

    constructor() {
        log.catchErrors()
        this.API = new API(this)

        app.on('ready', () => {
            this.createWindow()
        })

        process.env.APP_VERSION = app.getVersion()
        process.env.APP_NAME = app.getName()
    }

    private createWindow() {
        const window = new BrowserWindow({
            width: 1280,
            height: 720,
            minWidth: 960,
            minHeight: 720,
            frame: false,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
            },
            backgroundColor: '#ffffff',
        })

        if (MainApp.isDev) {
            Logger.get().info('Initialize dev server')
            if (MainApp.isDev) window.webContents.openDevTools()
            new DevServer().on('update', () => {
                Logger.get().info('Reloading dev server')
                window.webContents.send('dev:update')
                window.webContents.reload()
            })
        }

        window.on('close', () => app.quit())
        window.loadFile(Constants.MAIN_URL)

        this._MainWindow = window
    }
}
MainApp.run()
