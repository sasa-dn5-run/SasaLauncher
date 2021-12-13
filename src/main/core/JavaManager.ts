import http from 'http'
import https from 'https'
import path from 'path'
import EventEmitter from 'events'
import fs from 'fs-extra'
import StrictEventEmitter from 'strict-event-emitter-types'
import tar from 'tar'
import unzip from 'unzipper'
import { JavaVersion } from '../../@types/Distribution'
import { Constants } from '../Constants'

type Events = {
    download: {
        type: string
        total: number
        task: number
    }
    downloaded: void
    error: unknown
}
enum JavaVersionString {
    JAVA_1_8 = '8u312-b07',
    JAVA_17 = '17.0.1',
}
enum JavaURL {
    MACOS_JAVA_1_8 = 'https://github.com/adoptium/temurin8-binaries/releases/download/jdk8u312-b07/OpenJDK8U-jre_x64_mac_hotspot_8u312b07.tar.gz',
    MACOS_JAVA_17 = 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.1%2B12/OpenJDK17U-jdk_x64_mac_hotspot_17.0.1_12.tar.gz',

    WIN32_JAVA_1_8 = 'https://github.com/adoptium/temurin8-binaries/releases/download/jdk8u312-b07/OpenJDK8U-jre_x64_windows_hotspot_8u312b07.zip',
    WIN32_JAVA_17 = 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.1%2B12/OpenJDK17U-jdk_x64_windows_hotspot_17.0.1_12.zip',
}

export class JavaManager extends (EventEmitter as {
    new (): StrictEventEmitter<EventEmitter, Events>
}) {
    private get(version: JavaVersion) {
        let java: string | undefined
        const dir = path.join(Constants.DATA_PATH, 'java')
        if (!fs.existsSync(dir)) fs.mkdirSync(dir)
        const javas = fs.readdirSync(path.join(Constants.DATA_PATH, 'java'))
        switch (version) {
            case '1.8':
                java = javas.find((j) => j.match(JavaVersionString.JAVA_1_8)) ?? java
                break
            case '17':
                java = javas.find((j) => j.match(JavaVersionString.JAVA_17)) ?? java
                break
        }
        return java
    }

    public async getJava(version: JavaVersion) {
        const ext = process.platform === 'win32' ? '.exe' : ''
        let java = this.get(version)
        if (!java) {
            await this.install(version)
            java = this.get(version) as string
        }
        return process.platform === 'darwin' ? path.join(Constants.DATA_PATH, 'java', java, 'Contents', 'Home', 'bin', `java${ext}`) : path.join(Constants.DATA_PATH, 'java', java, 'bin', `java${ext}`)
    }

    public async install(version: JavaVersion) {
        let url: string | undefined
        let ext: 'zip' | 'tar.gz' = 'tar.gz'

        switch (process.platform) {
            case 'win32':
                ext = 'zip'
                switch (version) {
                    case '1.8':
                        url = JavaURL.WIN32_JAVA_1_8
                        break
                    case '17':
                        url = JavaURL.WIN32_JAVA_17
                        break
                }
                break
            case 'darwin':
                switch (version) {
                    case '1.8':
                        url = JavaURL.MACOS_JAVA_1_8
                        break
                    case '17':
                        url = JavaURL.MACOS_JAVA_17
                        break
                }
                break
        }

        if (!fs.existsSync(path.join(Constants.DATA_PATH, 'java'))) {
            fs.mkdirSync(path.join(Constants.DATA_PATH, 'java'))
        }
        if (!url) {
            throw new Error('Invalid platform')
        }

        const file = path.join(Constants.DATA_PATH, 'java', `temporary.${ext}`)

        try {
            await new Promise<void>((resolve, reject) => {
                const fileStream = fs.createWriteStream(file)
                const protocol = url?.startsWith('https') ? https : http
                protocol
                    .get(url as string, (url2) => {
                        const protocol2 = url2?.headers.location?.startsWith('https') ? https : http
                        protocol2
                            .get(url2?.headers.location as string, (res) => {
                                const length = parseInt(res.headers['content-length'] ?? '0')
                                res.pipe(fileStream)
                                res.on('error', reject)
                                res.on('data', () => {
                                    this.emit('download', {
                                        type: 'Java16',
                                        total: length,
                                        task: fileStream.bytesWritten,
                                    })
                                })
                                fileStream.on('error', reject)
                                fileStream.on('finish', () => {
                                    resolve()
                                })
                            })
                            .once('error', reject)
                    })
                    .once('error', reject)
            })

            await new Promise<void>((resolve) => {
                switch (ext) {
                    case 'zip':
                        fs.createReadStream(file)
                            .pipe(
                                unzip.Extract({
                                    path: path.join(Constants.DATA_PATH, 'java'),
                                }),
                            )
                            .on('close', resolve)
                        break
                    case 'tar.gz':
                        fs.createReadStream(file)
                            .pipe(
                                tar.x({
                                    cwd: path.join(Constants.DATA_PATH, 'java'),
                                }),
                            )
                            .on('close', resolve)
                        break
                }
            })

            this.emit('downloaded')
            fs.removeSync(file)
        } catch (error) {
            this.emit('error', error)
        }
    }
}
