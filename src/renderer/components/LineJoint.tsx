import React, { Component } from 'react'

export class LineJoint extends Component {
  public render() {
    return (
      <div
        style={{
          zIndex: 0,
          position: 'absolute',
          top: '70px',
          backgroundColor: 'white',
          width: '100%',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" style={{ isolation: 'isolate' }} viewBox="0 0 1280 100">
          <defs>
            <clipPath id="_clipPath_iIdn3kLdi9lE4yA6pTVL3BJvjs438nhI">
              <rect width="1280" height="100" />
            </clipPath>
          </defs>
          <g clipPath="url(#_clipPath_iIdn3kLdi9lE4yA6pTVL3BJvjs438nhI)">
            <rect x="0" y="0" width="1280" height="106" transform="matrix(1,0,0,1,0,0)" fill="rgb(76,123,87)" />
            <path d=" M 0 64 Q 388 5 672 37 Q 956 69 1280 30 L 1280 100 L 0 100 L 0 64 Z " fill="rgb(193,193,193)" fillOpacity="0.5" />
            <path d=" M 0 50.661 Q 338.97 85.206 671 56.195 Q 1003.03 27.183 1280 66.156 L 1280 106 L 0 106 L 0 50.661 Z " fill="rgb(255,255,255)" />
          </g>
        </svg>
      </div>
    )
  }
}
