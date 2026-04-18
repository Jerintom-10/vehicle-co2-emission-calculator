import React from 'react'
import './CarAnimation.css'

export default function CarAnimation() {
  return (
    <div className="car-animation-container">
      <div className="car">
        <div className="car-body">
          <div className="car-top"></div>
          <div className="car-window-front"></div>
          <div className="car-window-back"></div>
        </div>
        <div className="wheel wheel-front">
          <div className="wheel-circle"></div>
        </div>
        <div className="wheel wheel-back">
          <div className="wheel-circle"></div>
        </div>
      </div>
      <div className="exhaust-fumes"></div>
      <div className="road"></div>
    </div>
  )
}
