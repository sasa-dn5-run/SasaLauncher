import { ILauncherOptions } from 'minecraft-launcher-core'

export type ModLevel = 'require' | 'optionalon' | 'optionaloff' | 'additional'
export type JavaVersion = '1.8' | '17'

export interface File {
    name: string
    path: string
    link: string
    size: number
    md5: string
}

export interface Mod extends File {
    level: ModLevel
    enabled?: boolean
}

export interface ServerOption {
    name: string
    id: string
    description: string
    javaVersion: JavaVersion
    option: ILauncherOptions
    mods: Mod[]
    files: File[]
    forgeLib?: string
}

export interface Distribution {
    version: string
    servers: ServerOption[]
}
