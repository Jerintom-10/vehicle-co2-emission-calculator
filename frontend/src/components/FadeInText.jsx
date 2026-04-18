import React, { useEffect, useState } from 'react'
import './FadeInText.css'

export default function FadeInText() {
  const [animationData, setAnimationData] = useState(null)

  useEffect(() => {
    const fetchAnimation = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/animation')
        const data = await response.json()
        setAnimationData(data.animation)
      } catch (error) {
        console.error('Error:', error)
      }
    }

    fetchAnimation()
    const interval = setInterval(fetchAnimation, 3000)
    return () => clearInterval(interval)
  }, [])

  if (!animationData) return null

  return (
    <div className="fade-in-text">
      <div 
        className={`animated-text ${animationData.name}`}
        style={{ 
          color: animationData.color,
          animationDuration: `${animationData.duration}s`
        }}
      >
        {animationData.name.toUpperCase()}
      </div>
    </div>
  )
}
