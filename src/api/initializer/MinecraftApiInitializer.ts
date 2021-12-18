import { Mod } from '../../@types/Distribution'
import { ErrorConstants, isLauncherError } from '../../@types/ErrorConstants'
import { MainApp } from '../../main'
import { Logger } from '../../main/util/Logger'
import { IpcMainRouter } from '../types'

export class MinecraftApiInitializer {
    constructor(private readonly app: MainApp) {
        const router = new IpcMainRouter<Window['api']['minecraft']>('minecraft')
        router.handle('launch', async (e, id: string, disabledMods: string[]) => {
            this.app.Overlay.show('Launching...', 'progress')
            try {
                const client = await this.app.Launcher.createClient(id, disabledMods)
                client.on('task', (task) => {
                    this.app.Overlay.progress(task.name, task.value, task.total)
                })
                client.on('close', (code) => {
                    if (code !== 0) this.app.Overlay.error(ErrorConstants.MINECRAFT_CRASHED)
                })
                client.on('error', () => {
                    this.app.Overlay.error(ErrorConstants.MINECRAFT_LAUNCH_FAILED)
                })
                client.once('log', () => {
                    this.app.Overlay.close()
                })
                await client.launch()
            } catch (error) {
                if (isLauncherError(error)) {
                    this.app.Overlay.error(error)
                } else {
                    this.app.Overlay.error(ErrorConstants.UNKNOWN_ERROR)
                    Logger.get().error(error)
                }
            }
        })
        router.handle('getModStatus', (e, id: string) => {
            return this.app.Launcher.getModStatus(id)
        })
        router.handle('addAdditionalMod', (e, id: string, path: string) => {
            this.app.Launcher.addAdditionalMod(id, path)
        })
        router.handle('removeAdditionalMod', (e, id: string, mod: Mod) => {
            this.app.Launcher.removeAdditionalMod(id, mod)
        })
    }
}
