import { MainApp } from '../../main'
import { ConfigurationManager } from '../../main/core/ConfigurationManager'
import { IpcMainRouter } from '../types'

export class ConfigurationApiInitializer {
    constructor(private readonly app: MainApp) {
        const router = new IpcMainRouter<Window['api']['configuration']>('configuration')
        router.handle('get', () => {
            return ConfigurationManager.getConfig()
        })
        router.handle('save', (event, config) => {
            ConfigurationManager.saveConfig(config)
        })
    }
}
