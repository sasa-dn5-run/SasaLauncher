import { EventEmitter } from 'stream'
import { ipcRenderer, OpenDialogSyncOptions } from 'electron'
import { AuthType } from '../main/core/AccountManager'
import { Account } from './Account'
import { Configuration } from './Configuration'
import { Distribution, Mod } from './Distribution'
import { LauncherErrorType } from './ErrorConstants'
import { UpdateCheckResult } from 'electron-updater'

interface callbacks {
    [key: string]: (...args: any) => void
}

type ApiResponse = {
    success: boolean
    error?: LauncherErrorType
    data?: any
}

type API = {
    on: typeof ipcRenderer.on
    send: typeof ipcRenderer.send
    app: {
        name: string
        version: string
    }
    native: {
        showOpenDialog: (options: OpenDialogSyncOptions) => Promise<string[]>
    }
    window: {
        maximize: () => void
        minimize: () => void
        unmaximize: () => void
        isMaximized: () => Promise<boolean>
        close: () => void
    }
    distribution: {
        get: () => Promise<Distribution>
    }
    account: {
        getAccounts: () => Promise<Account[]>
        login: (type: AuthType, email?: string, password?: string) => Promise<ApiResponse>
        logout: (account: Account) => Promise<ApiResponse>
        select: (account: Account) => Promise<ApiResponse>
    }
    configuration: {
        get: () => Promise<Configuration>
        save: (configuration: Configuration) => Promise<ApiResponse>
    }
    minecraft: {
        launch: (id: string, disabledMods: string[]) => Promise<ApiResponse>
        getModStatus: (id: string) => Promise<Mod[]>
        addAdditionalMod: (id: string, path: string) => Promise<ApiResponse>
        removeAdditionalMod: (id: string, mod: Mod) => Promise<ApiResponse>
    }
}

declare global {
    interface Window {
        util: {
            events: {
                on: typeof EventEmitter.prototype.on
                once: typeof EventEmitter.prototype.once
                removeListener: typeof EventEmitter.prototype.removeListener
                removeAllListeners: typeof EventEmitter.prototype.removeAllListeners
                emit: typeof EventEmitter.prototype.emit
            }
        }
        api: API
    }
}
