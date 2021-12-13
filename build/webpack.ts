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
                if (err) console.error(err)
                if (err && !config.watch) reject(err)
                
                if (!config.watch) resolve(stats)
                else console.log(stats?.toString())
            })
        })
    }
}
