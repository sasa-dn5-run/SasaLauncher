import crypto from 'crypto'
import http from 'http'
import https from 'https'
import path from 'path'
import fs from 'fs-extra'
import { ILauncherOptions, IOverrides } from 'minecraft-launcher-core'
import { MainApp } from '..'
import { File, Mod, ServerOption } from '../../@types/Distribution'
import { ErrorConstants } from '../../@types/ErrorConstants'
import { Constants } from '../Constants'
import { SasaClient } from './Client'
import { ConfigurationManager } from './ConfigurationManager'
import { DistributionManager } from './DistributionManager'

interface SasaOverride extends IOverrides {
    gameDirectory: string
}
interface SasaLauncherOptions extends ILauncherOptions {
    overrides: SasaOverride
}

export class MinecraftManager {
    constructor(private app: MainApp) {}

    public getModStatus(id: string) {
        const config = ConfigurationManager.getConfig()
        const distro = DistributionManager.getDistribution()
        const option = distro.servers.find((v) => v.id === id)
        if (!option) return []
        const dir = path.join(config.MinecraftDataFolder, id, 'mods')
        const exists = fs.existsSync(dir)

        const mods: Mod[] = option.mods.map((m) => {
            m.enabled = !exists ? true : !fs.existsSync(path.join(dir, m.name)) && !fs.existsSync(path.join(dir, m.name + '.disabled'))
            return m
        })
        if (exists) {
            for (const file of fs.readdirSync(dir)) {
                if (!file.endsWith('.disabled') && !file.endsWith('.jar')) continue
                const disabled = file.endsWith('.disabled')
                const name = file.replace('.disabled', '')
                const modinfo = option.mods.find((mod) => mod.name === name)
                if (modinfo) {
                    modinfo.enabled = !disabled
                    mods.splice(mods.indexOf(option.mods.find((v) => v.name === name) as Mod), 1, modinfo)
                } else {
                    mods.push({
                        name: name,
                        path: path.join(dir, file),
                        link: '',
                        size: 0,
                        md5: '',
                        level: 'additional',
                        enabled: !disabled,
                    })
                }
            }
        }
        return mods
    }

    public async createClient(id: string, disableModList: Array<string>): Promise<SasaClient> {
        const DATA_PATH = Constants.DATA_PATH
        const config = ConfigurationManager.getConfig()

        const account = this.app.AccountManager.CurrentAccount
        if (!account) {
            throw ErrorConstants.ACCOUNT_NOT_FOUND
        }

        const distro = DistributionManager.getDistribution()

        const option = distro.servers.find((v) => v.id === id) as ServerOption

        await this.saveFiles(option.files)
        await this.saveMods(option.mods)
        this.disableMods(disableModList, id)

        const IOption = option?.option as SasaLauncherOptions
        if (!account.refreshToken) throw new Error('refreshToken is not set')
        if (account.type === 'mojang') {
            IOption.authorization = this.app.AccountManager.refreshMojangAuth(account.refreshToken)
        } else if (account.type === 'microsoft') {
            IOption.authorization = this.app.AccountManager.refreshMicrosoftAuth(account.refreshToken)
        }

        if (!IOption.root || Object.keys(IOption.root).length === 0) IOption.root = path.join(DATA_PATH, '.minecraft')
        else IOption.root = this.pathResolve(IOption.root)

        if (IOption.forge) IOption.forge = this.pathResolve(IOption.forge)

        IOption.overrides.gameDirectory = path.join(config.MinecraftDataFolder, option.id)

        IOption.memory.max = config.Xmx || '2G'
        IOption.memory.min = config.Xms || '2G'

        option.option = IOption

        const client = new SasaClient(option)
        return client
    }

    private disableMods(disableModList: Array<string>, id: string) {
        const config = ConfigurationManager.getConfig()
        const modDir = path.join(config.MinecraftDataFolder, id, 'mods')

        if (!fs.existsSync(modDir)) return

        for (const v of fs.readdirSync(modDir)) {
            if (disableModList.includes(v)) {
                if (v.endsWith('.disabled')) continue
                fs.renameSync(path.join(modDir, v), path.join(modDir, v + '.disabled'))
            } else {
                if (disableModList.filter((v2) => v.startsWith(v2)).length < 1 && v.endsWith('.disabled')) fs.renameSync(path.join(modDir, v), path.join(modDir, v.replace('.disabled', '')))
            }
        }
    }

    private async saveFiles(files: File[]) {
        for (const v of files) {
            const filePath = await this.pathResolve(v.path)
            const fileDir = path.dirname(filePath)
            if (fs.existsSync(filePath)) {
                const md5hash = crypto.createHash('md5')
                md5hash.update(fs.readFileSync(filePath))
                if (md5hash.digest('hex') === v.md5) continue
            }

            if (!fs.existsSync(fileDir)) {
                fs.mkdirsSync(fileDir)
            }
            await this.downloadFile(v.link, filePath)
        }
    }

    private async saveMods(mods: Mod[]) {
        for (const v of mods) {
            const filePath = (await this.pathResolve(v.path)).replace(/require|optionalon|optionaloff/g, 'mods')
            const fileDir = path.dirname(filePath)

            if (fs.existsSync(filePath)) {
                const md5hash = crypto.createHash('md5')
                md5hash.update(fs.readFileSync(filePath))
                const hex = md5hash.digest('hex')

                if (hex === v.md5) continue
            }
            if (fs.existsSync(filePath + '.disabled')) {
                const md5hash = crypto.createHash('md5')
                md5hash.update(fs.readFileSync(filePath + '.disabled'))
                const hex = md5hash.digest('hex')

                if (hex === v.md5) continue
            }

            if (!fs.existsSync(fileDir)) {
                fs.mkdirsSync(fileDir)
            }

            await this.downloadFile(v.link, filePath)
        }
    }

    public addAdditionalMod(id: string, modPath: string) {
        const distro = DistributionManager.getDistribution()
        const option = distro.servers.find((v) => v.id === id) as ServerOption

        const fileDir = this.pathResolve(`\${MCDATADIR}/${option.id}/mods`)
        if (!fs.existsSync(fileDir)) {
            fs.mkdirsSync(fileDir)
        }

        fs.copySync(modPath, path.join(fileDir, path.basename(modPath)))
    }
    public removeAdditionalMod(id: string, mod: Mod) {
        const distro = DistributionManager.getDistribution()
        const option = distro.servers.find((v) => v.id === id) as ServerOption

        const fileDir = this.pathResolve(`\${MCDATADIR}/${option.id}/mods`)

        if (!fs.existsSync(fileDir)) return
        if (!fs.existsSync(path.join(fileDir, mod.name))) {
            if (fs.existsSync(path.join(fileDir, mod.name + '.disabled'))) fs.unlinkSync(path.join(fileDir, mod.name + '.disabled'))
            return
        }
        fs.removeSync(path.join(fileDir, mod.name))
    }

    private pathResolve(p: string): string {
        const DATA_PATH = Constants.DATA_PATH
        const config = ConfigurationManager.getConfig()
        return path
            .join(p.replace('${MCDATADIR}', path.join(config.MinecraftDataFolder)).replace('${MCLIBDIR}', path.join(DATA_PATH, '.minecraft')))
            .replace('${APPDATA}', path.join(Constants.DATA_PATH, '..'))
    }

    public downloadFile(url: string, dest: string) {
        return new Promise<Buffer>((resolve, reject) => {
            const protocol = url.startsWith('https') ? https : http
            const ws = fs.createWriteStream(dest)
            protocol
                .get(url, (res) => {
                    res.pipe(ws)
                    res.on('error', reject)
                    ws.on('finish', () => {
                        resolve(fs.readFileSync(dest))
                    })
                    ws.on('error', reject)
                })
                .on('error', reject)
        })
    }
}
