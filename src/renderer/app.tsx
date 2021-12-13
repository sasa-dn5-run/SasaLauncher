import React, { Component } from 'react'
import { Frame } from './components/Frame'
import { Header } from './components/Header'
import { MainWindow } from './components/MainWindow'
import { Overlay } from './components/Overlay'
import { Window } from './components/Window'

import './styles/global.scss'

export class App extends Component {
  public render() {
    return (
      <>
        <Frame />
        <Window>
          <Header />
          <MainWindow />
        </Window>
        <Overlay />
      </>
    )
  }
}
