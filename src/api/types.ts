import { ipcMain, IpcMainEvent, IpcMainInvokeEvent, ipcRenderer, IpcRendererEvent } from 'electron'
import { callbacks } from '../@types/api'

export class RendererHandler<M extends callbacks> {
    constructor(private key: string) {}

    public on(channel: keyof M, listener: (event: IpcRendererEvent, ...args: any[]) => void) {
        return ipcRenderer.on(`${this.key}:${channel}`, listener)
    }
    public send(channel: keyof M, ...args: any[]) {
        return ipcRenderer.send(`${this.key}:${channel}`, ...args)
    }
    public async invoke<S extends keyof M>(channel: S, ...args: any[]): Promise<ReturnType<M[S]>> {
        return await ipcRenderer.invoke(`${this.key}:${channel}`, ...args)
    }
}
export class IpcMainRouter<M extends callbacks> {
    constructor(private key: string) {}

    public handle<S extends keyof M>(key: S, listener: (event: IpcMainInvokeEvent, ...args: any[]) => any) {
        ipcMain.handle(`${this.key}:${key}`, listener)
    }
    public on(key: keyof M, listener: (event: IpcMainEvent, ...args: any[]) => void) {
        return ipcMain.on(`${this.key}:${key}`, listener)
    }
}
