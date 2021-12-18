import { AuthenticationError } from 'minecraft-auth'
import { Account } from '../../@types/Account'
import { ErrorConstants } from '../../@types/ErrorConstants'
import { ApiResponse } from '../../@types/_Api'
import { MainApp } from '../../main'
import { AccountManager, AuthType } from '../../main/core/AccountManager'
import { Logger } from '../../main/util/Logger'
import { IpcMainRouter } from '../types'

export class AccountApiInitializer {
    constructor(private readonly app: MainApp) {
        const router = new IpcMainRouter<Window['api']['account']>('auth')
        router.handle('getAccounts', () => {
            return this.app.AccountManager.Accounts
        })
        router.handle('login', async (e, type: AuthType, email?: string, password?: string) => {
            this.app.Overlay.show('ログイン中...')
            try {
                switch (type) {
                    case 'microsoft': {
                        const code = await this.app.AccountManager.openLoginWindow()
                        const iuser = await this.app.AccountManager.microsoftAuth(code)

                        if (this.app.AccountManager.Accounts.find((a) => a.uuid === iuser.uuid)) {
                            this.app.Overlay.error(ErrorConstants.ACCOUNT_ALREADY_EXISTS)
                            break
                        }

                        this.app.AccountManager.addAccount(AccountManager.parse(iuser, 'microsoft'))
                        break
                    }
                    case 'mojang': {
                        if (this.app.AccountManager.Accounts.find((a) => a.email === email)) {
                            this.app.Overlay.error(ErrorConstants.ACCOUNT_ALREADY_EXISTS)
                            break
                        }

                        const iuser = await this.app.AccountManager.mojangAuth(email as string, password as string)
                        const account = AccountManager.parse(iuser, 'mojang')
                        account.email = email as string
                        account.password = password as string
                        this.app.AccountManager.addAccount(account)
                        break
                    }
                }
                this.app.Overlay.close()
            } catch (error) {
                this.app.Overlay.error(ErrorConstants.UNKNOWN_ERROR)
                Logger.get().error(error)
            }
        })
        router.handle('logout', (e, account: Account) => {
            this.app.AccountManager.removeAccount(account)
        })
        router.handle('select', (e, account: Account) => {
            this.app.AccountManager.selectAccount(account)
        })
    }
}
