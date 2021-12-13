import { MainApp } from '../../main'
import { IpcMainRouter } from '../types'

export class WindowApiInitializer {
    constructor(private readonly _App: MainApp) {
        const router = new IpcMainRouter<Window['api']['window']>('window')
        router.handle('isMaximized', () => {
            return this._App.MainWindow?.isMaximized()
        })
        router.on('maximize', () => {
            this._App.MainWindow?.maximize()
        })
        router.on('unmaximize', () => {
            this._App.MainWindow?.unmaximize()
        })
        router.on('minimize', () => {
            this._App.MainWindow?.minimize()
        })
        router.on('close', () => {
            this._App.MainWindow?.close()
        })
    }
}
