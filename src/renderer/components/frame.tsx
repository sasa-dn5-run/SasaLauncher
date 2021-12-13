import React, { Component } from 'react'

import styles from '../styles/components/Frame.module.scss'

export class Frame extends Component {
  
  public render() {
    return (
      <div className={styles.frame}>
        <div className={styles.attribute}></div>
        <div className={styles.frameMain}>
          <div className={styles.frameTitleName}>
            <h1>{window.api.app.name}</h1>
            <p>{window.api.app.version}</p>
          </div>
          <div>
            <div className={styles.AppCloseButton} onClick={this.close}>
              <p className="material-icons">close</p>
            </div>
            <div className={styles.AppMaximizeButton} onClick={this.maximize}>
              <p className="material-icons">check_box_outline_blank</p>
            </div>
            <div className={styles.AppHideButton} onClick={this.minimize}>
              <p className="material-icons">horizontal_rule</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  private close() {
    window.api.window.close()
  }
  private minimize() {
    window.api.window.minimize()
  }
  private async maximize() {
    const isMaximized = await window.api.window.isMaximized()
    isMaximized ? window.api.window.unmaximize() : window.api.window.maximize()
  }
}
