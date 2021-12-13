import { MainApp } from '../../main'
import { Logger } from '../../main/util/Logger'

export class CoreApiInitializer {
    constructor(private readonly app: MainApp) {
        Logger.get().on('log', (log) => {
            if (this.app.MainWindow) this.app.MainWindow.webContents.send('log', log)
        })
    }
}
