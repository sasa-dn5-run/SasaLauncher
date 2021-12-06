import { contextBridge, ipcRenderer } from 'electron'
import { RendererHandler } from '../api/types'

const window = new RendererHandler<Window['api']['window']>('window')

const api: Window['api'] = {
    on: ipcRenderer.on.bind(ipcRenderer),
    app: {
        name: process.env.APP_NAME ?? '',
        version: process.env.APP_VERSION ?? '',
    },
    window: {
        maximize: () => window.send('maximize'),
        minimize: () => window.send('minimize'),
        unmaximize: () => window.send('unmaximize'),
        isMaximized: async () => await window.invoke('isMaximized'),
        close: () => window.send('close'),
    },
}

contextBridge.exposeInMainWorld('api', api)
