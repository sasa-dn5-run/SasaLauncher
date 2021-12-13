import classNames from 'classnames'
import React from 'react'
import { Variable } from '../../Variable'
import style from '../../styles/components/MainWindows/Launcher.module.scss'
import { BaseWindow, Props } from './BaseWindow'
import { LaunchConfig } from './components/LaunchConfig'

export class Launcher extends BaseWindow {

  public static readonly id = 'launcher'
  
  constructor(props: Props) {
    super(props, Launcher.id)
  }

  public render() {
    const distro = Variable.distribution
    return (
      <div className={classNames(this.props.className, style.container)} style={Object.assign({}, this.props.style, this.state.style)}>
        <h1 className={style.title}>起動</h1>
        <div className={style.servers}>
          {distro.servers.map((server) => {
            return <LaunchConfig key={server.id} option={server} />
          })}
        </div>
      </div>
    )
  }
}
