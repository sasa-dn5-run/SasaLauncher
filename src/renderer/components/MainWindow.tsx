import React, { Component } from 'react'
import { Variable } from '../Variable'
import style from '../styles/components/MainWindow.module.scss'
import { Accounts } from './MainWindows/Accounts'
import { BaseWindow } from './MainWindows/BaseWindow'
import { Debug } from './MainWindows/Debug'
import { Launcher } from './MainWindows/Launcher'
import { Login } from './MainWindows/Login'
import { Setting } from './MainWindows/Setting'

export class MainWindow extends Component {
  constructor(props: any) {
    super(props)

    if (Variable.accounts.length !== 0) {
      this.position = {
        left: [Login, Accounts],
        current: Launcher,
        right: [Setting, Debug],
      }
    }
  }

  private position: {
    left: typeof BaseWindow[]
    right: typeof BaseWindow[]
    current: typeof BaseWindow
  } = {
    left: [Accounts],
    current: Login,
    right: [Launcher, Setting, Debug],
  }

  private toggleWindow(dest: 'next' | 'back') {
    const next = dest === 'next' ? this.position.right[0] : this.position.left[0]
    const current = this.position.current

    if (!next) return

    window.util.events.emit(dest === 'next' ? 'window:slide:left' : 'window:slide:right', current.id)
    window.util.events.emit('window:slide:center', next.id)

    if (dest === 'next') {
      this.position.left.unshift(current)
      this.position.right.shift()
    } else {
      this.position.right.unshift(current)
      this.position.left.shift()
    }
    this.position.current = next
  }

  private build() {
    return (
      <>
        {this.position.left.map((Window) => {
          return (
            <Window
              key={Window.name}
              className={style.window}
              style={{
                left: '-50%',
              }}
            />
          )
        })}
        {<this.position.current key={this.position.current.name} className={style.window} />}
        {this.position.right.map((Window) => {
          return (
            <Window
              key={Window.name}
              className={style.window}
              style={{
                left: '150%',
              }}
            />
          )
        })}
      </>
    )
  }

  public render() {
    return (
      <div className={style.MainWindow}>
        {this.build()}
        <p className={style['button-back']} id="mainBack" onClick={this.toggleWindow.bind(this, 'back')}>
          navigate_before
        </p>
        <p className={style['button-next']} id="mainNext" onClick={this.toggleWindow.bind(this, 'next')}>
          navigate_next
        </p>
      </div>
    )
  }
}
