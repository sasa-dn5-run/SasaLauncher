import path from 'path'
import fs from 'fs-extra'
import { Configuration } from '../../@types/Configuration'
import { Constants } from '../Constants'

export class ConfigurationManager {
    private static checkVersion() {
        if (!fs.existsSync(path.join(Constants.DATA_PATH, 'version.json'))) {
            if (!fs.existsSync(path.join(Constants.DATA_PATH))) {
                fs.mkdirSync(Constants.DATA_PATH)
            } else {
                fs.removeSync(Constants.DATA_PATH)
                fs.mkdirSync(Constants.DATA_PATH)
                fs.writeJSONSync(path.join(Constants.DATA_PATH, 'version.json'), { version: Constants.APP_VERSION })
            }
        }
    }
    public static init() {
        this.checkVersion()
        const config: Configuration = {
            MinecraftDataFolder: path.join(Constants.DATA_PATH, 'servers'),
            Xmx: '4G',
            Xms: '4G',
        }
        fs.writeJSONSync(path.join(Constants.DATA_PATH, 'config.json'), config, { spaces: 4 })
    }
    public static getConfig(): Configuration {
        return fs.readJSONSync(path.join(Constants.DATA_PATH, 'config.json'))
    }
    public static saveConfig(config: Configuration) {
        fs.writeJSONSync(path.join(Constants.DATA_PATH, 'config.json'), config, { spaces: 4 })
    }
}
