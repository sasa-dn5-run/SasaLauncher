import { ipcRenderer } from 'electron'

interface callbacks {
    [key: string]: () => void
}

declare global {
    interface Window {
        api: {
            on: typeof ipcRenderer.on
            app: {
                name: string
                version: string
            }
            window: {
                maximize: () => void
                minimize: () => void
                unmaximize: () => void
                isMaximized: () => Promise<boolean>
                close: () => void
            }
        }
    }
}
