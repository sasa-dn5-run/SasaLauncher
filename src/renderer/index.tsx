import React from 'react'
import ReactDOM from 'react-dom'
import { Distribution } from '../@types/Distribution'
import { GlobalController } from './OverlayController'
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
    this.initUpdater()
    Renderer.distribution = await window.api.distribution.get()
    ReactDOM.render(<App />, document.getElementById('root'))
  }

  private initUpdater() {
    window.api.on('updater', async (event, arg, err) => {
      switch (arg) {
        case 'update-available': {
          if (Variable.updating) GlobalController.Overlay.change('新しいバージョンがあります')
          break
        }
        case 'update-downloaded': {
          if (Variable.updating) {
            const answer = await GlobalController.Overlay.question('アップデートを実行します。よろしいですか？')
            if (!answer) return
            window.api.send('updater', 'install')
            Variable.updating = false
          }
          break
        }
        case 'update-not-available': {
          if (Variable.updating) {
            GlobalController.Overlay.change('アップデートは見つかりませんでした。')
            Variable.updating = false
          }
          break
        }
        case 'checking-for-update': {
          if (Variable.updating) GlobalController.Overlay.change('アップデートを確認しています。')
          break
        }
        case 'error': {
          if (Variable.updating) {
            GlobalController.Overlay.change('アップデート中にエラーが発生しました。')
            Variable.updating = false
            console.error(err)
          }
          break
        }
      }
    })
    window.api.send('updater', 'init')
  }
}
Renderer.run()
