import { contextBridge, ipcRenderer } from 'electron'
import { EventEmitter } from 'events'
import { RendererHandler } from '../api/types'

const window = new RendererHandler<Window['api']['window']>('window')
const native = new RendererHandler<Window['api']['native']>('native')
const distribution = new RendererHandler<Window['api']['distribution']>('distribution')
const account = new RendererHandler<Window['api']['account']>('auth')
const configuration = new RendererHandler<Window['api']['configuration']>('configuration')
const minecraft = new RendererHandler<Window['api']['minecraft']>('minecraft')

const events = new EventEmitter()

const api: Window['api'] = {
    on: ipcRenderer.on.bind(ipcRenderer),
    app: {
        name: process.env.APP_NAME ?? '',
        version: process.env.APP_VERSION ?? '',
    },
    native: {
        showOpenDialog: async (option) => await native.invoke('showOpenDialog', option),
    },
    window: {
        maximize: () => window.send('maximize'),
        minimize: () => window.send('minimize'),
        unmaximize: () => window.send('unmaximize'),
        isMaximized: async () => await window.invoke('isMaximized'),
        close: () => window.send('close'),
    },
    distribution: {
        get: async () => distribution.invoke('get'),
    },
    account: {
        getAccounts: async () => await account.invoke('getAccounts'),
        login: async (type, email, password) => account.invoke('login', type, email, password),
        logout: async (ac) => account.invoke('logout', ac),
        select: async (ac) => account.invoke('select', ac),
    },
    configuration: {
        get: async () => await configuration.invoke('get'),
        save: async (config) => await configuration.invoke('save', config),
    },
    minecraft: {
        launch: async (id, disabledMods) => await minecraft.invoke('launch', id, disabledMods),
        getModStatus: async (id) => await minecraft.invoke('getModStatus', id),
        addAdditionalMod: async (id, path) => await minecraft.invoke('addAdditionalMod', id, path),
        removeAdditionalMod: async (id, mod) => await minecraft.invoke('removeAdditionalMod', id, mod),
    },
}

const util: Window['util'] = {
    events: {
        on: events.on.bind(events),
        once: events.once.bind(events),
        removeListener: events.removeListener.bind(events),
        removeAllListeners: events.removeAllListeners.bind(events),
        emit: events.emit.bind(events),
    },
}

contextBridge.exposeInMainWorld('api', api)
contextBridge.exposeInMainWorld('util', util)
