import classNames from 'classnames'
import React from 'react'
import { Account } from '../../../@types/Account'
import { GlobalController } from '../../OverlayController'
import { Variable } from '../../Variable'
import style from '../../styles/components/MainWindows/Accounts.module.scss'
import { BaseWindow, Props } from './BaseWindow'

export class Accounts extends BaseWindow {
  public static readonly id = 'Accounts'

  constructor(props: Props) {
    super(props, Accounts.id)
    this.state = {
      className: '',
      style: {},
      data: Variable.accounts,
    }

    window.util.events.on('variable:init', () => {
      this.setState({
        data: Variable.accounts,
      })
    })
  }

  private async selectAccount(account: Account) {
    await window.api.account.select(account)
    await Variable.init()
  }
  private async removeAccount(account: Account) {
    const confirm = await GlobalController.Overlay.question('ログアウトします、よろしいですか？')
    if (!confirm) return
    await window.api.account.logout(account)
    await Variable.init()
  }

  public render() {
    return (
      <div className={classNames(this.props.className, style.container)} style={Object.assign({}, this.props.style, this.state.style)}>
        <h1>アカウント</h1>
        <div className={style.accounts}>
          {(this.state.data as Account[]).map((account) => {
            return (
              <div key={account.uuid} className={style.account}>
                <div className={style.info}>
                  <img src={`https://crafatar.com/avatars/${account.uuid}?size=100`} alt="" />
                  <div>
                    <p>username</p>
                    <h1>{account.username}</h1>
                    <p>uuid</p>
                    <h2>{account.uuid}</h2>
                  </div>
                </div>
                <div className={style.control}>
                  <button onClick={this.selectAccount.bind(this, account)}>
                    <p>選択</p>
                  </button>
                  <button onClick={this.removeAccount.bind(this, account)}>
                    <p>ログアウト</p>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}
