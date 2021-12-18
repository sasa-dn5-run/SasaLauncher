export interface LauncherErrorType {
    message: string
    code: string
}

export const isLauncherError = (error: any): error is LauncherErrorType => {
    return error.message !== undefined && error.code !== undefined
}

export class ErrorConstants {
    public static readonly UNKNOWN_ERROR: LauncherErrorType = {
        message: 'An unknown error has occurred',
        code: 'unknown_error',
    }
    public static readonly ACCOUNT_ALREADY_EXISTS: LauncherErrorType = {
        message: 'アカウントがすでに存在しています。',
        code: '01x010001',
    }
    public static readonly ACCOUNT_NOT_FOUND: LauncherErrorType = {
        message: 'アカウントが見つかりません。',
        code: '01x010002',
    }

    public static readonly MINECRAFT_LAUNCH_FAILED: LauncherErrorType = {
        message: '起動に失敗しました。',
        code: '01x020001',
    }
    public static readonly MINECRAFT_CRASHED: LauncherErrorType = {
        message: 'クラッシュしました。',
        code: '01x020002',
    }
}
