import React from 'react'
import ReactDOM from 'react-dom'
import { Distribution } from '../@types/Distribution'
import { Variable } from './Variable'
import { App } from './app'

export class Renderer {
  
  public static run() {
    new Renderer()
  }
  public static distribution?: Distribution

  constructor() {
    this.init()
  }

  private async init() {
    window.api.on('log', console.log)
    await Variable.init()
    Renderer.distribution = await window.api.distribution.get()

    ReactDOM.render(<App />, document.getElementById('root'))
  }
}
Renderer.run()
