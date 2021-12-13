import React, { Component } from 'react'
import { Account } from '../../@types/Account'
import { Variable } from '../Variable'
import style from '../styles/components/Header.module.scss'
import { LineJoint } from './LineJoint'

export class Header extends Component<
  {},
  {
    account: Account
  }
> {
  
  constructor(props: {}) {
    super(props)
    this.state = {
      account: Variable.accounts.find((v) => v.selected) || Variable.accounts[0],
    }
    window.util.events.on('variable:init', () => {
      this.setState({
        account: Variable.accounts.find((v) => v.selected) || Variable.accounts[0],
      })
    })
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
              <p className={style['update-info']} id="UpdateNoticeParagraph" style={{ opacity: 0 }}>
                アップデートがあります→
              </p>
              <p
                className={style['update-button']}
                onClick={() => {
                  /* checkUpdate() */
                }}
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
