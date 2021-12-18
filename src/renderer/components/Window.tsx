import React, { Component, RefObject } from 'react'

export class Window extends Component {
  private static _instance: RefObject<HTMLDivElement>
  public static get instance() {
    return Window._instance.current as HTMLDivElement
  }

  public static fadeOut(time = 100) {
    return new Promise((resolve) => {
      this.instance.style.pointerEvents = 'none'
      this.instance.style.filter = 'blur(2.5px)'
      this.instance.animate([{ filter: 'blur(0px)' }, { filter: 'blur(2.5px)' }], time).onfinish = resolve
    })
  }
  public static fadeIn(time = 100) {
    return new Promise((resolve) => {
      this.instance.style.pointerEvents = 'all'
      this.instance.style.filter = 'blur(0px)'
      this.instance.animate([{ filter: 'blur(2.5px)' }, { filter: 'blur(0px)' }], time).onfinish = resolve
    })
  }

  private ref = React.createRef<HTMLDivElement>()

  constructor(props: any) {
    super(props)
    Window._instance = this.ref
  }

  public render() {
    return <div ref={this.ref}>{this.props.children}</div>
  }
}
