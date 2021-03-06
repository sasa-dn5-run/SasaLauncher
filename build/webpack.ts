import EventEmitter from 'events'
import { Configuration, Stats, webpack } from 'webpack'
export class Webpack {
    public static event = new EventEmitter()
    public static run(config: Configuration) {
        return new Promise<Stats | undefined>((resolve, reject) => {
            webpack(config, (err, stats) => {
                if (config.watch) {
                    this.event.emit('update')
                }
                if ((stats?.hasErrors() || err) && !config.watch) reject(stats?.toString())

                if (!config.watch) resolve(stats)
                else console.log(stats?.toString())
            })
        })
    }
}
