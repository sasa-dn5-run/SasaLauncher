import path from 'path'
import { app } from 'electron'
import { MainApp } from '.'

export class Constants {
    public static readonly DATA_PATH = path.join(
        process.platform === 'linux' ? app.getPath('home') : app.getPath('appData'),
        process.env.NODE_ENV === 'development' ? '.sasalauncher-dev' : '.sasalauncher',
    )

    public static readonly APP_NAME = app.getName()
    public static readonly APP_VERSION = app.getVersion()
    public static readonly APP_PATH = path.join(__dirname, 'app')

    public static readonly MAIN_URL = path.join(Constants.APP_PATH, 'index.html')

    public static readonly PACK_URL = 'https://raw.githubusercontent.com/sasadd-LAB/SasaPacks2/master'
    public static readonly PACK_URL_DEV = 'https://raw.githubusercontent.com/sasadd-LAB/SasaPacks2/dev'

    public static readonly MS_APP_ID = '${{MS_APP_ID}}'
    public static readonly MS_APP_SECRET = '${{MS_APP_SECRET}}'
    public static readonly MS_APP_URL = '${{MS_APP_URL}}'
}
