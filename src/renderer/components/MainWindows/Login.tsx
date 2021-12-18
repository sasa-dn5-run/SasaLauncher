import classNames from 'classnames'
import React from 'react'
import { GlobalController } from '../../OverlayController'
import { Variable } from '../../Variable'
import style from '../../styles/components/MainWindows/Login.module.scss'
import { BaseWindow, Props } from './BaseWindow'

export class Login extends BaseWindow {
  public static readonly id = 'login'

  private readonly user = {
    email: React.createRef<HTMLInputElement>(),
    password: React.createRef<HTMLInputElement>(),
  }

  constructor(props: Props) {
    super(props, Login.id)
  }

  private async MojangLogin() {
    const email = this.user.email.current?.value
    const password = this.user.password.current?.value
    await window.api.account.login('mojang', email, password)
    await Variable.init()
  }

  private async MicrosoftLogin() {
    await window.api.account.login('microsoft')
    await Variable.init()
  }

  public render() {
    return (
      <div className={classNames(this.props.className, style.container)} style={Object.assign({}, this.props.style, this.state.style)}>
        <div className={style.inputSpace}>
          <h1>ログイン</h1>
          <h2>Mojangアカウント</h2>
          <div className={style.input}>
            <p>メールアドレス</p>
            <input ref={this.user.email} type="email" placeholder="email" />
          </div>
          <div className={style.input}>
            <p>パスワード</p>
            <input ref={this.user.password} type="password" placeholder="password" />
          </div>
          <button onClick={this.MojangLogin.bind(this)}>
            <p>ログイン</p>
          </button>
          <h2>Microsoftアカウント</h2>
          <button onClick={this.MicrosoftLogin.bind(this)}>
            <p>Microsoftログイン</p>
          </button>
        </div>
      </div>
    )
  }
}
