import React, { Component, RefObject } from 'react'
import { Mod, ServerOption } from '../../../../@types/Distribution'
import { GlobalController } from '../../../OverlayController'

import style from '../../../styles/components/MainWindows/components/LaunchConfig.module.scss'

type Props = {
  option: ServerOption
}

export class LaunchConfig extends Component<
  Props,
  {
    maxHeight: string
    mods: Mod[]
  }
> {
  private ref: RefObject<HTMLDivElement>
  private height!: number
  private mods: {
    [key: string]: boolean
  } = {}

  constructor(p: Props) {
    super(p)
    this.state = {
      maxHeight: '150px',
      mods: [],
    }
    this.ref = React.createRef()
    this.init()
  }

  public componentDidMount() {
    this.height = this.ref.current?.scrollHeight ?? 1000
  }

  private async init() {
    const mods = await window.api.minecraft.getModStatus(this.props.option.id)
    this.setState({
      mods: mods,
    })
    this.height = this.ref.current?.scrollHeight ?? 1000
  }

  private changeHeight() {
    this.setState({
      maxHeight: this.state.maxHeight === '150px' ? `${this.height}px` : '150px',
    })
  }
  private launch() {
    const disabledMods = []
    for (const v of Object.keys(this.mods)) {
      if (this.mods[v] === false) {
        disabledMods.push(v)
      }
    }
    window.api.minecraft.launch(this.props.option.id, disabledMods)
  }
  private async addAdditionalMod() {
    const data = await window.api.native.showOpenDialog({
      title: '追加するModを選択',
      properties: ['openFile'],
      filters: [{ name: 'Mod', extensions: ['jar'] }],
    })
    await window.api.minecraft.addAdditionalMod(this.props.option.id, data[0])
    await this.init()
    this.setState({
      maxHeight: `${this.height}px`,
    })
  }
  private async removeAdditionalMod(mod: Mod) {
    const confirm = await GlobalController.Overlay.question('Modを削除します。よろしいですか？')
    if (!confirm) return
    await window.api.minecraft.removeAdditionalMod(this.props.option.id, mod)
    this.init()
  }

  private buildMods() {
    const mods = this.state.mods
    return (
      <>
        <div className={style.mods}>
          {mods.filter((v) => v.level === 'require').length > 0 && <h2>Required Mods</h2>}
          {mods
            .filter((v) => v.level === 'require')
            .map((mod) => {
              return (
                <div className={style.mod} key={`${this.props.option.id}_${mod.name}`}>
                  <h2>{mod.name}</h2>
                  <div></div>
                </div>
              )
            })}
        </div>
        <div className={style.mods}>
          {mods.filter((v) => v.level !== 'require' && v.level !== 'additional').length > 0 && <h2>Optional Mods</h2>}
          {mods
            .filter((v) => v.level !== 'require' && v.level !== 'additional')
            .map((mod) => {
              return (
                <div className={style.mod} key={`${this.props.option.id}_${mod.name}`}>
                  <h2>{mod.name}</h2>
                  <div className={style.modSwitch}>
                    <input
                      type="checkbox"
                      id={`${this.props.option.id}_${mod.md5}`}
                      defaultChecked={mod.enabled}
                      onChange={(e) => {
                        this.mods[mod.name] = e.target.checked
                      }}
                    />
                    <label htmlFor={`${this.props.option.id}_${mod.md5}`}></label>
                  </div>
                </div>
              )
            })}
        </div>
        <div className={style.mods}>
          {mods.filter((v) => v.level === 'additional').length > 0 && <h2>Additional Mods</h2>}
          {mods
            .filter((v) => v.level === 'additional')
            .map((mod) => {
              return (
                <div className={style.mod} key={`${this.props.option.id}_${mod.name}`}>
                  <h2>{mod.name}</h2>
                  <div className={style.buttons}>
                    <button onClick={this.removeAdditionalMod.bind(this, mod)}>
                      <p>delete</p>
                    </button>
                    <div className={style.modSwitch}>
                      <input
                        type="checkbox"
                        id={`${this.props.option.id}_${mod.md5}`}
                        defaultChecked={mod.enabled}
                        onChange={(e) => {
                          this.mods[mod.name] = e.target.checked
                        }}
                      />
                      <label htmlFor={`${this.props.option.id}_${mod.md5}`}></label>
                    </div>
                  </div>
                </div>
              )
            })}

          <div className={style.addModButton}>
            <h2>MODを追加する</h2>
            <button onClick={this.addAdditionalMod.bind(this)}>
              <p>note_add</p>
            </button>
          </div>
        </div>
      </>
    )
  }

  public render() {
    const op = this.props.option
    return (
      <div
        ref={this.ref}
        className={style.container}
        style={{
          maxHeight: this.state.maxHeight,
        }}
      >
        <div className={style.wrapper}>
          <div className={style.controller}>
            <div>
              <button className={style.launch} onClick={this.launch.bind(this)}>
                <p>起動</p>
              </button>
            </div>
            <div>
              <button onClick={this.changeHeight.bind(this)}>
                <p>詳細</p>
              </button>
            </div>
          </div>
          <div className={style.information}>
            <h1 className={style.title}>{op.name}</h1>
            <p className={style.version}>{`${op.option.version.number} ${op.option.forge ? 'forge' : op.option.version.custom ?? ''}`}</p>
            <p className={style.description}>{op.description}</p>
          </div>
          {this.buildMods()}
        </div>
      </div>
    )
  }
}
