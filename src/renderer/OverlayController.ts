import { LauncherErrorType } from '../@types/ErrorConstants'
import { OverlayMode } from './components/Overlay'

export class GlobalController {
    public static Overlay = class {
        public static close: () => void
        public static show: (msg: string, mode?: OverlayMode) => Promise<void>
        public static error: (error: LauncherErrorType) => Promise<void>
        public static question: (msg: string) => Promise<boolean>
        public static progress: (msg: string, value: number, max: number) => void
        public static showing: () => boolean
    }
}
