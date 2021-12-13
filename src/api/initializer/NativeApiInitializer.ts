import { dialog, OpenDialogSyncOptions } from 'electron'
import { MainApp } from '../../main'
import { IpcMainRouter } from '../types'

export class NativeApiInitializer {
    constructor(private readonly app: MainApp) {
        const router = new IpcMainRouter<Window['api']['native']>('native')
        router.handle('showOpenDialog', (e, options: OpenDialogSyncOptions) => {
            return dialog.showOpenDialogSync(options)
        })
    }
}
