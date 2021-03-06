import path from 'path'
import { EventEmitter } from 'stream'
import fs from 'fs-extra'
import StrictEventEmitter from 'strict-event-emitter-types/types/src'
import { Constants } from '../Constants'

enum Level {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
}
type Events = {
    debug: unknown[]
    info: string[]
    warn: unknown[]
    error: unknown[]
    log: string
}
export class Logger extends (EventEmitter as new () => StrictEventEmitter<EventEmitter, Events>) {
    private static _instance: Logger

    public static init(level: Level) {
        this._instance = new Logger(level)
    }

    public static get() {
        if (!Logger._instance) {
            Logger._instance = new Logger()
        }
        return Logger._instance
    }

    private readonly logDir
    private readonly level: Level
    private readonly writeFile

    constructor(level: Level = Level.INFO) {
        super()
        this.level = level
        this.logDir = path.join(Constants.DATA_PATH, 'logs')
        if (!fs.existsSync(this.logDir)) fs.mkdirSync(this.logDir)
        this.writeFile = fs.createWriteStream(path.join(this.logDir, `${new Date().toISOString().replace(/:/g, '_')}.log`))
    }

    private log(level: Level, args: unknown[]) {
        if (level >= this.level) {
            const log = `[${new Date().toISOString()}] ${args.join(' ')}\n`
            process.stdout.write(log)
            this.writeFile.write(log)
            this.emit('log', log)
        }

        process.on('uncaughtException', (err) => {
            this.error(err.message)
            process.exit(1)
        })
        process.on('unhandledRejection', (reason, p) => {
            this.error(`Unhandled Rejection at: Promise ${p}, reason: ${reason}`)
            process.exit(1)
        })
    }
    public debug(...args: unknown[]) {
        this.log(Level.DEBUG, ['[DEBUG]', args])
        this.emit('debug', args)
    }
    public info(...args: string[]) {
        this.log(Level.INFO, ['[INFO]', args])
        this.emit('info', args)
    }
    public warn(...args: unknown[]) {
        this.log(Level.WARN, ['[WARN]', args])
        this.emit('warn', args)
    }
    public error(...args: unknown[]) {
        this.log(Level.ERROR, ['[ERROR]', args])
        this.emit('error', args)
    }
}
