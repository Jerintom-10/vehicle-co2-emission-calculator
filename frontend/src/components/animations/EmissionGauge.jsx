import React from 'react'
import { getRatingColor } from '../../styles/theme'
import './EmissionGauge.css'

export default function EmissionGauge({ co2Value, rating }) {
  const maxCO2 = 250
  const percentage = (co2Value / maxCO2) * 100
  const gaugeColor = getRatingColor(rating)

  return (
    <div className="emission-gauge">
      <div className="gauge-outer">
        <div className="gauge-inner">
          <div className="gauge-fill" style={{
            width: `${percentage}%`,
            backgroundColor: gaugeColor
          }}></div>
        </div>
      </div>
      <div className="gauge-info">
        <div className="gauge-value">{co2Value.toFixed(1)}</div>
        <div className="gauge-unit">g/km</div>
        <div className="gauge-rating" style={{ color: gaugeColor }}>
          {rating}
        </div>
      </div>
    </div>
  )
}
