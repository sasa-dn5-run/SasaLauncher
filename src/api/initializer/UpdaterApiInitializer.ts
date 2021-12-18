import { ipcMain } from "electron";
import { autoUpdater } from "electron-updater";
import { MainApp } from "../../main";

export class UpdaterApiInitializer {

    constructor(
        private readonly app: MainApp
    ) {
        ipcMain.on('updater', (event, arg) => {
            switch(arg){
                case 'init': {
                    autoUpdater.on('update-available', () => {
                        event.sender.send('updater', 'update-available')
                    })
                    autoUpdater.on('update-downloaded', () => {
                        event.sender.send('updater', 'update-downloaded')
                    })
                    autoUpdater.on('update-not-available', () => {
                        event.sender.send('updater', 'update-not-available')
                    })
                    autoUpdater.on('checking-for-update', () => {
                        event.sender.send('updater', 'checking-for-update')
                    })
                    autoUpdater.on('error', (err) => {
                        event.sender.send('updater', 'error', err)
                    })
                    autoUpdater.checkForUpdates()
                    break
                }
                case 'check': {
                    try {
                        autoUpdater.checkForUpdates()
                    } catch (error) {
                        event.sender.send('updater', 'error', error)
                    }
                    break
                }
                case 'install': {
                    try {
                        autoUpdater.quitAndInstall()
                    } catch (error) {
                        event.sender.send('updater', 'error', error)
                    }
                    break
                }
                
            }
        })
    }

}
