import { MainApp } from '../main'
import { IpcMainRouter } from './types'

export class API {
    constructor(private app: MainApp) {
        this.windowListener()
    }

    private windowListener() {
        const router = new IpcMainRouter<Window['api']['window']>('window')
        router.handle('isMaximized', () => {
            return this.app.MainWindow?.isMaximized()
        })
        router.on('maximize', () => {
            this.app.MainWindow?.maximize()
        })
        router.on('unmaximize', () => {
            this.app.MainWindow?.unmaximize()
        })
        router.on('minimize', () => {
            this.app.MainWindow?.minimize()
        })
        router.on('close', () => {
            this.app.MainWindow?.close()
        })
    }
}
