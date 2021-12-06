import { execSync, spawn, StdioOptions } from 'child_process'
import path from 'path'
import EventEmitter from 'events'
import fs from 'fs-extra'

export class Yarn {
    public static event = new EventEmitter()
    public static run(command: string, cwd: string, args?: string[]) {
        execSync(`yarn ${command} ${args?.join(' ') ?? ''}`, { cwd, stdio: 'inherit' })
    }
    public static runAsync(command: string, cwd: string, args?: string[], stdio?: StdioOptions) {
        return new Promise<void>((resolve, reject) => {
            const yarn = spawn(process.platform === 'win32' ? command + '.cmd' : command, args ?? [], { cwd, stdio: stdio ?? 'inherit' })
            yarn.once('error', (error) => {
                reject(error)
            })
            yarn.once('exit', (code) => {
                if (code === 0) {
                    resolve()
                } else {
                    reject(new Error(`Exit code: ${code}`))
                }
            })
            yarn.stdout?.on('data', (data) => {
                Yarn.event.emit(`${command}:data`, data)
            })
        })
    }

    public static getScripts(cwd?: string): string[] {
        const scripts = fs.readJSONSync(path.join(cwd ?? '.', 'package.json')).scripts
        return Object.keys(scripts)
    }

    public static install(cwd: string) {
        return Yarn.run('install', cwd)
    }
}
