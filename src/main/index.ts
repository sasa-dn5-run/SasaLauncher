import path from 'path'
import { app, BrowserWindow } from 'electron'
import { API } from '../api'
import { Overlay } from '../api/Overlay'
import { Constants } from './Constants'
import { AccountManager } from './core/AccountManager'
import { ConfigurationManager } from './core/ConfigurationManager'
import { DistributionManager } from './core/DistributionManager'
import { MinecraftManager } from './core/MinecraftManager'
import { DevServer } from './dev/server'
import { Logger } from './util/Logger'

export class MainApp {
    public static run() {
        new MainApp()
    }
    public static isDev = process.env.NODE_ENV === 'development'

    //Main process
    private readonly _AccountManager: AccountManager
    private readonly _Launcher: MinecraftManager

    public get AccountManager() {
        return this._AccountManager
    }
    public get Launcher() {
        return this._Launcher
    }

    //Renderer process
    private readonly _API: API
    private readonly _Overlay: Overlay

    public get API() {
        return this._API
    }
    public get Overlay() {
        return this._Overlay
    }

    private _MainWindow!: BrowserWindow
    public get MainWindow() {
        return this._MainWindow
    }

    constructor() {
        this._AccountManager = new AccountManager()
        this._Launcher = new MinecraftManager(this)

        this._API = new API(this)
        this._Overlay = new Overlay(this)

        ConfigurationManager.init()

        app.on('ready', () => {
            this.init()
        })

        process.env.APP_VERSION = app.getVersion()
        process.env.APP_NAME = app.getName()
        if (MainApp.isDev) {
            //dev only
        }
    }

    private async init() {
        if (!MainApp.isDev) await DistributionManager.download()
        this.createWindow()
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
