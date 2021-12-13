import { Account } from '../@types/Account'
import { Configuration } from '../@types/Configuration'
import { Distribution } from '../@types/Distribution'

export class Variable {
    public static distribution: Distribution
    public static accounts: Account[]
    public static configuration: Configuration

    public static async init() {
        Variable.distribution = await window.api.distribution.get()
        Variable.accounts = await window.api.account.getAccounts()
        Variable.configuration = await window.api.configuration.get()
        window.util.events.emit('variable:init')
    }
}
