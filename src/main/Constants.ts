import path from 'path'
import { app } from 'electron'

export class Constants {
    public static readonly APP_NAME = app.getName()
    public static readonly APP_VERSION = app.getVersion()
    public static readonly APP_PATH = path.join(__dirname, 'app')
    public static readonly MAIN_URL = path.join(Constants.APP_PATH, 'assets', 'index.html')
}
