import React from 'react'
import './CarAnimation.css'

export default function CarAnimation() {
  return (
    <div className="car-animation-container" aria-hidden="true">

      {/* Sky backdrop */}
      <div className="car-anim-sky" />

      {/* Animated car */}
      <div className="car-anim-car">

        {/* Exhaust puffs — left of car */}
        <div className="car-anim-exhaust">
          <div className="car-anim-puff" />
          <div className="car-anim-puff" />
          <div className="car-anim-puff" />
        </div>

        {/* Windows */}
        <div className="car-anim-window car-anim-window-front" />
        <div className="car-anim-window car-anim-window-back" />

        {/* Cabin */}
        <div className="car-anim-cabin" />

        {/* Body */}
        <div className="car-anim-body" />

        {/* Headlight */}
        <div className="car-anim-headlight" />

        {/* Wheels */}
        <div className="car-anim-wheel car-anim-wheel-front" />
        <div className="car-anim-wheel car-anim-wheel-back" />

      </div>

      {/* Road */}
      <div className="car-anim-road">
        <div className="car-anim-road-line" />
      </div>

    </div>
  )
}