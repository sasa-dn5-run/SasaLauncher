import http from 'http'
import https from 'https'
import path from 'path'
import EventEmitter from 'events'
import fs from 'fs-extra'
import { Client } from 'minecraft-launcher-core'
import StrictEventEmitter from 'strict-event-emitter-types/types/src'
import unzip from 'unzipper'
import { ServerOption } from '../../@types/Distribution'
import { Constants } from '../Constants'
import { Logger } from '../util/Logger'
import { JavaManager } from './JavaManager'

type Events = {
    task: {
        name: string
        value: number
        total: number
    }
    log: string
    error: unknown
    close: number
}

export class SasaClient extends (EventEmitter as {
    new (): StrictEventEmitter<EventEmitter, Events>
}) {
    private _Client: Client
    private _Option: ServerOption
    private _JavaManger: JavaManager

    public get option() {
        return this._Option
    }

    constructor(option: ServerOption) {
        super()
        this._Option = option
        this._Client = new Client()
        this._JavaManger = new JavaManager()

        this._Client.on('data', (data) => {
            Logger.get().info(data.replace(/(\r\n)+$/g, ''))
            this.emit('log', data)
        })
        this._Client.on('close', this.emit.bind(this, 'close'))
        this._Client.on('progress', (progress) => {
            this.emit('task', {
                name: `Downloading ${progress.type}`,
                value: progress.task,
                total: progress.total,
            })
        })
        this._JavaManger.on('download', (progress) => {
            this.emit('task', {
                name: 'Installing Java',
                value: progress.task,
                total: progress.total,
            })
        })
    }

    public async launch() {
        try {
            this._Option.option.javaPath = await this._JavaManger.getJava(this._Option.javaVersion)
            if (this._Option.forgeLib) {
                await this.extractForge()
            }
            this._Client.launch(this._Option.option)
        } catch (error) {
            this.emit('error', error)
        }
    }
    private async extractForge() {
        if (!this._Option.forgeLib) return

        const url = this._Option.forgeLib
        const MCLIBDIR = path.join(Constants.DATA_PATH, '.minecraft')
        const temp = path.join(MCLIBDIR, 'forgeLibCache', path.basename(url))
        const client = url.startsWith('https') ? https : http

        if (!fs.existsSync(path.dirname(temp))) fs.mkdirpSync(path.dirname(temp))
        if (fs.existsSync(temp)) return

        try {
            await new Promise<void>((resolve, reject) => {
                client.get(url, (res) => {
                    const ws = fs.createWriteStream(temp)
                    const total = parseInt(res.headers['content-length'] as string)
                    res.pipe(ws)
                    res.on('data', () => {
                        this.emit('task', {
                            name: 'Extracting Forge Lib',
                            value: ws.bytesWritten,
                            total: total,
                        })
                    })
                    res.on('error', reject)
                    ws.on('error', reject)
                    ws.on('finish', resolve)
                })
            })

            await new Promise<void>((resolve, reject) => {
                fs.createReadStream(temp)
                    .pipe(
                        unzip.Extract({
                            path: path.join(MCLIBDIR, 'libraries'),
                        }),
                    )
                    .on('error', reject)
                    .on('close', resolve)
            })
        } catch (error) {
            this.emit('error', error)
        }
    }
}
