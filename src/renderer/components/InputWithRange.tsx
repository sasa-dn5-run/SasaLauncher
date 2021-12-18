import React, { Component, FormEvent, RefObject } from 'react'
import style from '../styles/components/InputWithRange.module.scss'

type Props = {
  step: number
  min: number
  max: number
  value: string
  inputRef?: RefObject<HTMLInputElement>
}
export class InputWithRange extends Component<
  Props,
  {
    value: string
  }
> {
  constructor(props: Props) {
    super(props)
    this.state = {
      value: this.props.value ?? '',
    }
  }

  private setValue(e: FormEvent<HTMLInputElement>) {
    this.setState({
      value: e.currentTarget.value,
    })
  }

  public render() {
    return (
      <div className={style.container}>
        <input
          ref={this.props.inputRef}
          type="number"
          className={style.number}
          value={this.state.value}
          step={this.props.step}
          max={this.props.max}
          min={this.props.min}
          onInput={this.setValue.bind(this)}
        />
        <input type="range" className={style.range} value={this.state.value} step={this.props.step} max={this.props.max} min={this.props.min} onInput={this.setValue.bind(this)} />
      </div>
    )
  }
}
