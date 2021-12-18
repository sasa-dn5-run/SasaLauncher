import React, { Component } from 'react'
import { Account } from '../../@types/Account'
import { Variable } from '../Variable'
import style from '../styles/components/Header.module.scss'
import { LineJoint } from './LineJoint'
import { GlobalController } from '../OverlayController'

export class Header extends Component<
  {},
  {
    account: Account
    hasUpdate: boolean
  }
> {
  
  constructor(props: {}) {
    super(props)
    this.state = {
      account: Variable.accounts.find((v) => v.selected) || Variable.accounts[0],
      hasUpdate: false
    }
    window.util.events.on('variable:init', () => {
      this.setState({
        account: Variable.accounts.find((v) => v.selected) || Variable.accounts[0],
      })
    })
  }

  private async checkUpdate(){
    if (Variable.updating) return
    Variable.updating = true
    GlobalController.Overlay.show('アップデートを確認中...')
    window.api.send('updater', 'check')
  }

  public render() {
    return (
      <div className={style.header}>
        <div className={style.body}>
          <div className={style.right}>
            <h1 className={style.title}>SasaLauncher2</h1>
          </div>
          <div className={style.left}>
            <div className={style['update']}>
              <p className={style['update-info']} id="UpdateNoticeParagraph" style={{ opacity: this.state.hasUpdate ? 1 : 0 }}>
                アップデートがあります→
              </p>
              <p
                className={style['update-button']}
                onClick={this.checkUpdate.bind(this)}
              >
                system_update_alt
              </p>
            </div>
            <div className={style.account}>
              <div>
                <p className="username">{this.state.account ? this.state.account.username : ''}</p>
                {this.state.account && <img className="usericon" src={`https://crafatar.com/avatars/${this.state.account.uuid ?? ''}?size=50`} alt="" />}
              </div>
            </div>
          </div>
        </div>
        <LineJoint />
      </div>
    )
  }
}
