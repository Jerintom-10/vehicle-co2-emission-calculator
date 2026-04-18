import React, { useState } from 'react'
import './CounterAnimation.css'

export default function CounterAnimation({ onCount }) {
  const [count, setCount] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState(null)

  const handleIncrement = async () => {
    const newCount = count + 1
    setCount(newCount)

    try {
      const response = await fetch('http://localhost:8000/api/counter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newCount })
      })
      const data = await response.json()
      setResult(data)
      setShowResult(true)
      setTimeout(() => setShowResult(false), 3000)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="counter-container">
      <div className="counter-display">
        <span className="counter-value">{count}</span>
      </div>
      
      <button className="counter-btn" onClick={handleIncrement}>
        <span>+1</span>
      </button>

      {showResult && result && (
        <div className="result-popup">
          <div className="result-item">Doubled: {result.doubled}</div>
          <div className="result-item">Squared: {result.squared}</div>
        </div>
      )}
    </div>
  )
}
