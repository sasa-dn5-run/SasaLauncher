import React, { Component, RefObject } from 'react'
import { LauncherErrorType } from '../../@types/ErrorConstants'
import { GlobalController } from '../OverlayController'

import style from '../styles/components/Overlay.module.scss'
import { Window } from './Window'

export type OverlayMode = 'normal' | 'error' | 'question' | 'progress' | 'loading'
export class Overlay extends Component<
  {},
  {
    mode: OverlayMode
    msg: string
    error: {
      code: string
    }
    progress: {
      value: number
      max: number
    }
  }
> {

  private _Container: RefObject<HTMLDivElement>
  private get container() {
    return this._Container.current as HTMLDivElement
  }

  private showing = false

  private questionCallback?: (result: boolean) => void

  constructor(props = {}) {
    super(props)
    this._Container = React.createRef()
    this.state = {
      mode: 'normal',
      msg: '',
      error: {
        code: '',
      },
      progress: {
        value: 0,
        max: 0,
      },
    }
    this.initHanlder()
  }

  private initHanlder() {
    GlobalController.Overlay.close = this.close.bind(this)
    GlobalController.Overlay.show = this.show.bind(this)
    GlobalController.Overlay.error = this.error.bind(this)
    GlobalController.Overlay.question = this.question.bind(this)
    GlobalController.Overlay.progress = this.progress.bind(this)
    GlobalController.Overlay.showing = () => {
      return this.container.style.display === 'block'
    }

    window.api.on('overlay:close', this.close.bind(this))
    window.api.on('overlay:show', (e, msg: string, mode: OverlayMode) => {
      this.show(msg, mode)
    })
    window.api.on('overlay:error', (e, error: LauncherErrorType) => {
      this.error(error)
    })
    window.api.on('overlay:progress', (e, msg: string, value: number, max: number) => {
      this.progress(msg, value, max)
    })
  }

  public componentDidMount() {
    this.container.style.display = 'none'
  }

  private close() {
    if (!this.showing) return
    this.showing = false
    Window.fadeIn(200)
    this.container.animate([{ opacity: 1 }, { opacity: 0 }], 100).onfinish = () => {
      this.container.style.display = 'none'
    }
  }
  private show(msg: string, mode: OverlayMode = 'normal') {
    return new Promise<void>((resolve) => {
      this.setState({
        mode: mode,
        msg: msg,
      })
      if (!this.showing) {
        Window.fadeOut(200)
        this.container.style.display = 'block'
        this.container.animate([{ opacity: 0 }, { opacity: 1 }], 100).onfinish = () => {
          resolve()
        }
      }
      this.showing = true
    })
  }
  private async error(error: LauncherErrorType) {
    this.setState({
      error: {
        code: error.code,
      },
    })
    await this.show(error.message, 'error')
  }
  private async question(msg: string) {
    return new Promise<boolean>((resolve) => {
      this.questionCallback = (result) => {
        this.close()
        resolve(result)
      }
      this.show(msg, 'question')
    })
  }
  private progress(msg: string, value: number, max: number) {
    this.setState({
      msg: msg,
      progress: {
        value: value,
        max: max,
      },
    })
  }

  
  public render() {
    return (
      <div ref={this._Container} className={style.container}>
        <div className={style.wrapper}>
          <h1>{this.state.msg}</h1>
          <div>
            {this.state.mode === 'normal' && (
              <button onClick={this.close.bind(this)}>
                <p>閉じる</p>
              </button>
            )}
            {this.state.mode === 'error' && (
              <>
                <p>ErrorCode: {this.state.error.code}</p>
                <button onClick={this.close.bind(this)}>
                  <p>閉じる</p>
                </button>
              </>
            )}
            {this.state.mode === 'question' && (
              <>
                <button onClick={this.questionCallback?.bind(this, true)}>
                  <p>OK</p>
                </button>
                <button onClick={this.questionCallback?.bind(this, false)}>
                  <p>Cancel</p>
                </button>
              </>
            )}
            {this.state.mode === 'progress' && <progress max={this.state.progress.max} value={this.state.progress.value} />}
          </div>
        </div>
      </div>
    )
  }
}
