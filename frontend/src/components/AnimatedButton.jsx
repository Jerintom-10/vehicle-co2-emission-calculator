import React from 'react'
import './AnimatedButton.css'

export default function AnimatedButton({ onClick, children, className = '' }) {
  return (
    <button 
      className={`animated-btn ${className}`}
      onClick={onClick}
    >
      <span className="btn-text">{children}</span>
      <span className="btn-glow"></span>
    </button>
  )
}
