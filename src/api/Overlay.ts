import { LauncherErrorType } from '../@types/ErrorConstants'
import { MainApp } from '../main'
import { OverlayMode } from '../renderer/components/Overlay'

export class Overlay {
    constructor(private readonly app: MainApp) {}

    public close() {
        this.app.MainWindow.webContents.send('overlay:close')
    }
    public show(message: string, mode: OverlayMode) {
        this.app.MainWindow.webContents.send('overlay:show', message, mode)
    }
    public error(error: LauncherErrorType) {
        this.app.MainWindow.webContents.send('overlay:error', error)
    }
    public progress(msg: string, value: number, max: number) {
        this.app.MainWindow.webContents.send('overlay:progress', msg, value, max)
    }
}
