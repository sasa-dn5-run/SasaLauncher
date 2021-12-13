import path from 'path'
import { BrowserWindow } from 'electron'
import fs from 'fs-extra'
import { MicrosoftAccount, MicrosoftAuth, MojangAccount } from 'minecraft-auth'
import { IUser } from 'minecraft-launcher-core'
import { Account } from '../../@types/Account'
import { Constants } from '../Constants'

export type AuthType = 'microsoft' | 'mojang'
export class AccountManager {
    private _Accounts: Account[]
    private currentAccount: Account | undefined

    public get Accounts() {
        return this._Accounts
    }
    public get CurrentAccount() {
        return this.currentAccount
    }

    constructor() {
        const file = path.join(Constants.DATA_PATH, 'accounts.json')
        if(!fs.existsSync(file)) fs.writeJSONSync(file, [])
        this._Accounts = fs.readJSONSync(path.join(Constants.DATA_PATH, 'accounts.json'))
        this.currentAccount = this._Accounts.find((v) => v.selected)
        MicrosoftAuth.setup(Constants.MS_APP_ID, Constants.MS_APP_SECRET, Constants.MS_APP_URL)
    }

    public static parse(iuser: IUser, type: AuthType): Account {
        return {
            type: type,
            username: iuser.name,
            uuid: iuser.uuid,
            refreshToken: iuser.client_token,
        }
    }

    public selectAccount(account: Account) {
        if (!account) {
            this.currentAccount = undefined
            return
        }
        this._Accounts.forEach((v) => {
            v.selected = false
        })

        account.selected = true
        this.currentAccount = account

        this._Accounts.splice(this._Accounts.indexOf(this._Accounts.find((v) => v.uuid === account.uuid) as Account), 1, account)

        this.saveAccounts()
    }
    public addAccount(account: Account) {
        if (!this.currentAccount) {
            account.selected = true
            this.currentAccount = account
        }
        this._Accounts.push(account)
        this.saveAccounts()
    }
    public removeAccount(account: Account) {
        this._Accounts.splice(this._Accounts.indexOf(this._Accounts.find((v) => v.uuid === account.uuid) as Account), 1)
        this.selectAccount(this._Accounts[0])
        this.saveAccounts()
    }
    private saveAccounts() {
        fs.writeJSONSync(path.join(Constants.DATA_PATH, 'accounts.json'), this._Accounts, { spaces: 2 })
    }

    public openLoginWindow() {
        return new Promise<string>((resolve, reject) => {
            const window = new BrowserWindow({
                width: 500,
                height: 600,
            })
            window.webContents.on('did-navigate', async (event, url) => {
                if (url.startsWith('https://site.sasadd.net/SasaLauncher2/oauth')) {
                    const code = new URL(url).searchParams.get('code')
                    window.removeAllListeners('close')

                    const cookies = await window.webContents.session.cookies.get({})
                    for (const v of cookies) {
                        let url = ''
                        url += v.secure ? 'https://' : 'http://'
                        url += v.domain?.charAt(0) === '.' ? 'www' : ''
                        url += v.domain
                        url += v.path
                        await window.webContents.session.cookies.remove(url, v.name)
                    }

                    window.close()
                    if (!code) {
                        reject('Failed to get code')
                        return
                    }
                    resolve(code)
                }
            })
            window.once('close', () => {
                reject('canceled')
            })
            window.setMenu(null)
            window.loadURL(MicrosoftAuth.createUrl())
        })
    }

    public async mojangAuth(username: string, password: string) {
        const account = new MojangAccount()
        await account.Login(username, password)
        const profile = await account.getProfile()
        const userProfile: IUser = {
            access_token: account.accessToken,
            client_token: account.clientToken,
            uuid: profile.id,
            name: profile.name,
            user_properties: [],
        }
        return userProfile
    }

    public async microsoftAuth(code: string) {
        const account = new MicrosoftAccount()
        await account.authFlow(code)
        const profile = await account.getProfile()
        const userProfile: IUser = {
            access_token: account.accessToken,
            client_token: account.refreshToken,
            uuid: profile.id,
            name: profile.name,
            user_properties: [],
        }
        return userProfile
    }

    public async refreshMojangAuth(token: string) {
        const account = new MojangAccount()
        account.clientToken = token
        await account.refresh()
        const profile = await account.getProfile()
        const userProfile: IUser = {
            access_token: account.accessToken,
            client_token: account.clientToken,
            uuid: profile.id,
            name: profile.name,
            user_properties: [],
        }
        return userProfile
    }

    public async refreshMicrosoftAuth(token: string) {
        const account = new MicrosoftAccount()
        account.refreshToken = token
        await account.refresh()
        const profile = await account.getProfile()
        const userProfile: IUser = {
            access_token: account.accessToken,
            client_token: account.refreshToken,
            uuid: profile.id,
            name: profile.name,
            user_properties: [],
        }
        return userProfile
    }
}
