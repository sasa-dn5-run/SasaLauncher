import React from 'react';
import ReactDOM from "react-dom"
import { App } from "./app";

export class Renderer {

  public static run() {
    new Renderer()
  }

  constructor() {
    ReactDOM.render(<App />, document.getElementById('root'))
  }
}
Renderer.run()
