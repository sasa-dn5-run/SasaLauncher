import { Component, CSSProperties } from 'react'

export type Props = {
  className?: string
  style?: CSSProperties
}

export class BaseWindow extends Component<
  Props,
  {
    className: string
    style: CSSProperties
    data?: any
  }
> {

  public static readonly id: string

  private _id: string
  public get id() {
    return this._id
  }
  constructor(props: Props, id: string) {
    super(props)
    this._id = id
    this.state = {
      className: '',
      style: {},
    }

    window.util.events.on('window:slide:right', (id) => {
      if (id === this._id) {
        this.setState({
          style: {
            left: '150%',
          },
        })
      }
    })
    window.util.events.on('window:slide:left', (id) => {
      if (id === this._id) {
        this.setState({
          style: {
            left: '-50%',
          },
        })
      }
    })
    window.util.events.on('window:slide:center', (id) => {
      if (id === this._id) {
        this.setState({
          style: {
            left: '50%',
          },
        })
      }
    })
  }
}
