import https from 'https'
import path from 'path'
import fs from 'fs-extra'
import { MainApp } from '..'
import { Distribution } from '../../@types/Distribution'
import { Constants } from '../Constants'

export class DistributionManager {
    private static DistributionPath = path.join(Constants.DATA_PATH, 'distribution.json')
    public static download() {
        return new Promise<void>((resolve, reject) => {
            https.get(`${MainApp.isDev ? Constants.PACK_URL_DEV : Constants.PACK_URL}/distribution.json`, (res) => {
                const ws = fs.createWriteStream(DistributionManager.DistributionPath)
                res.pipe(ws)
                res.on('end', resolve)
                res.on('error', reject)
            })
        })
    }
    public static getDistribution(): Distribution {
        return fs.readJSONSync(DistributionManager.DistributionPath)
    }
}
