import classNames from 'classnames'
import React from 'react'
import style from '../../styles/components/MainWindows/Debug.module.scss'
import { BaseWindow, Props } from './BaseWindow'

export class Debug extends BaseWindow {

  public static readonly id = 'Debug'
  
  private readonly logRef = React.createRef<HTMLDivElement>()

  constructor(props: Props) {
    super(props, Debug.id)
  }

  public componentDidMount() {
    window.api.on('log', (event, data: string) => {
      const log = this.logRef.current
      if (log) {
        const p = document.createElement('p')
        p.innerText = data
        log.appendChild(p)
        if (log.scrollTop > log.scrollHeight - log.clientHeight - 100) {
          log.scrollTop = log.scrollHeight
        }
      }
    })
  }

  public render() {
    return (
      <div className={classNames(this.props.className, style.debug, this.state.className)} style={Object.assign({}, this.props.style, this.state.style)}>
        <h2>Debug Log</h2>
        <p>ここに表示されている内容は開発者以外には絶対に公開しないでください。Ctrl + Shift + I キーを同時に押すとより詳しい情報を確認できます。</p>
        <div className={style.log} ref={this.logRef}></div>
      </div>
    )
  }
}
