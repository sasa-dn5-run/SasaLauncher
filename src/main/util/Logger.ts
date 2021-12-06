type Level = 'debug' | 'info' | 'warn' | 'error'
export class Logger {
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

    private readonly level: Level

    constructor(level: Level = 'info') {
        this.level = level
    }

    private log(level: Level, args: unknown[]) {
        if (level === this.level) {
            console.log(...args)
        }
    }
    public debug(...args: unknown[]) {
        this.log('debug', args)
    }
    public info(...args: string[]) {
        this.log('info', args)
    }
    public warn(...args: unknown[]) {
        this.log('warn', args)
    }
    public error(...args: unknown[]) {
        this.log('error', args)
    }
}
