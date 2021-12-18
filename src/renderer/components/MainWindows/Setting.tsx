import classnames from 'classnames'
import React from 'react'
import { GlobalController } from '../../OverlayController'
import { Variable } from '../../Variable'
import style from '../../styles/components/MainWindows/Setting.module.scss'
import { InputWithRange } from '../InputWithRange'
import { BaseWindow, Props } from './BaseWindow'

export class Setting extends BaseWindow {
  public static readonly id = 'setting'

  private readonly config = {
    MinecraftDataFolder: React.createRef<HTMLInputElement>(),
    Xmx: React.createRef<HTMLInputElement>(),
    Xms: React.createRef<HTMLInputElement>(),
  }

  constructor(props: Props) {
    super(props, Setting.id)
  }

  private async saveConfiguration() {
    GlobalController.Overlay.show('保存中...')
    const MinecraftDataFolder = this.config.MinecraftDataFolder.current?.value ?? Variable.configuration.MinecraftDataFolder
    const Xmx = this.config.Xmx.current?.value
    const Xms = this.config.Xms.current?.value

    await window.api.configuration.save({
      MinecraftDataFolder,
      Xmx: `${Xmx}G`,
      Xms: `${Xms}G`,
    })
    GlobalController.Overlay.close()
  }

  public render() {
    const config = Variable.configuration

    return (
      <div className={classnames(style.container, this.props.className, this.state.className)} style={Object.assign({}, this.props.style, this.state.style)}>
        <h1>設定</h1>
        <div className={style.inputSpace}>
          <div className={style.input}>
            <p>データフォルダ</p>
            <input ref={this.config.MinecraftDataFolder} type="text" defaultValue={config.MinecraftDataFolder} />
          </div>
          <div className={style.input}>
            <p>最大メモリ割り当て</p>
            <InputWithRange inputRef={this.config.Xmx} step={0.5} max={16} min={1} value={config.Xmx.replace('G', '')} />
          </div>
          <div className={style.input}>
            <p>最小メモリ割り当て</p>
            <InputWithRange inputRef={this.config.Xms} step={0.5} max={16} min={1} value={config.Xms.replace('G', '')} />
          </div>
          <button onClick={this.saveConfiguration.bind(this)}>
            <p>保存</p>
          </button>
        </div>
      </div>
    )
  }
}
