import { MainApp } from '../../main'
import { DistributionManager } from '../../main/core/DistributionManager'
import { IpcMainRouter } from '../types'

export class DistributionApiInitializer {
    constructor(private readonly app: MainApp) {
        const router = new IpcMainRouter<Window['api']['distribution']>('distribution')
        router.handle('get', () => {
            return DistributionManager.getDistribution()
        })
    }
}
