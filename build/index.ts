import crypto from 'crypto'
import http from 'http'
import path from 'path'
import Zip from 'adm-zip'
import { build, CliOptions } from 'electron-builder'
import fs from 'fs-extra'
import yaml from 'yaml'
import webpackConfig from '../webpack.config'
import { Yarn } from './Yarn'
import { Webpack } from './webpack'

const pkg = fs.readJsonSync(path.join(__dirname, '..', 'package.json'))

class Main {
    private static readonly version = !!process.env.VERSION && (process.env.VERSION as string).split('.').length === 3 ? (process.env.VERSION as string) : '1.0.0'

    private static readonly extraOptions: string[] = []
    private static mode: 'development' | 'production' | 'none'
    public static async run(args: string[]) {
        const start = new Date().getTime()
        for (const v of args) {
            if (v.startsWith('--')) {
                this.extraOptions.push(v)
            }
        }
        switch (args[0]) {
            case 'dev': {
                this.mode = 'development'
                await this.dev()
                break
            }
            case 'compile': {
                this.mode = 'production'
                await this.compile()
                break
            }
            case 'build': {
                this.mode = 'production'
                await this.build()
                break
            }
            case 'publish': {
                this.mode = 'production'
                await this.publish()
                break
            }
        }
        const end = new Date().getTime()
        console.log(`Finished in ${(end - start) / 1000} seconds`)
        process.exit(0)
    }

    private static async dev() {
        await this.compile()

        const rendererConfig = webpackConfig.find((v) => v.name === 'renderer')
        if (!rendererConfig) {
            throw new Error('renderer config not found')
        }
        rendererConfig.mode = this.mode
        rendererConfig.watch = true

        await Promise.race([
            Yarn.runAsync('electron', '.', ['.', '--remote-debugging-port=9229']),
            Webpack.run(rendererConfig),
            new Promise(() => {
                Webpack.event.on('update', () => {
                    const req = http.request({
                        hostname: 'localhost',
                        port: process.env.DEV_PORT ?? 8080,
                    })
                    req.on('error', () => {
                        /*ignore*/
                    })
                    req.end()
                })
            }),
        ])
    }

    private static rewriteVersion() {
        console.log(`Rewriting version... ${this.version}`)
        const version = this.version
        const json = fs.readJSONSync('./package.json')
        json.version = version
        fs.writeJSONSync('./package.json', json, { spaces: 4 })
    }
    private static async compile() {
        console.log('Compiling...')
        if (this.extraOptions.includes('--clean') && fs.existsSync('./dist')) fs.removeSync('./dist')
        const tasks = []
        for (const config of webpackConfig) {
            config.mode = this.mode
            tasks.push(Webpack.run(config))
        }
        await Promise.all(tasks)
    }

    private static async build() {
        if ((this.extraOptions.includes('--clean') || this.extraOptions.includes('--full')) && fs.existsSync('./product')) fs.removeSync('./product')

        await this.compile()
        console.log('Building...')
        const config: CliOptions = {
            config: {
                appId: pkg.name,
                productName: pkg.name,
                artifactName: '${productName}-setup-${version}.${ext}',
                copyright: `Copyright © 2021 ${pkg.author}`,
                directories: {
                    buildResources: './build',
                    output: './product',
                },
                extraMetadata: {
                    main: pkg.main,
                },
                win: {
                    target: [
                        {
                            target: 'nsis',
                            arch: 'x64',
                        },
                    ],
                },
                nsis: {
                    oneClick: false,
                    perMachine: false,
                    allowElevation: true,
                    allowToChangeInstallationDirectory: true,
                },
                mac: {
                    target: 'dmg',
                    category: 'public.app-category.games',
                },
                linux: {
                    target: 'AppImage',
                    maintainer: pkg.author,
                    vendor: pkg.author,
                    description: pkg.description,
                    category: 'Game',
                },
                compression: 'maximum',
                files: ['./dist/**/*', './node_modules/**/*'],
                asar: true,
                icon: './icon/icon.png',
            },
            publish: 'never',
        }
        await build(config)
    }

    private static async publish() {
        this.rewriteVersion()
        await this.build()

        const unpackPath = process.platform === 'win32' ? './product/win-unpacked' : './product/mac'
        const yamlPath = process.platform === 'win32' ? './product/latest.yml' : './product/latest-mac.yml'

        const zip = new Zip()
        zip.addLocalFolder(unpackPath)
        zip.writeZip(`./product/${pkg.name}-setup-${this.version}.zip`)

        const md5 = crypto.createHash('sha256').update(zip.toBuffer()).digest('hex')

        const yml = yaml.parse(fs.readFileSync(yamlPath, 'utf8'))
        yml.zip = {
            sha256: md5,
            size: zip.toBuffer().length
        }
        fs.writeFileSync(yamlPath, yaml.stringify(yml))
    }
}
Main.run(process.argv.slice(2))
