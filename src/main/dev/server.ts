import http from 'http'
import EventEmitter from 'events'

export class DevServer extends EventEmitter {
    constructor() {
        super()
        http.createServer(() => {
            this.emit('update')
        }).listen(process.env.DEV_PORT ?? 8080)
    }
}
