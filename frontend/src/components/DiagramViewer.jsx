import React, { useState, useEffect } from 'react'
import { predictionAPI } from '../services/apiService'
import './DiagramViewer.css'

export default function DiagramViewer({ predictionId, onClose }) {
  const [diagram, setDiagram] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDiagram()
  }, [predictionId])

  const fetchDiagram = async () => {
    try {
      setLoading(true)
      const response = await predictionAPI.getDiagramPreview(predictionId)
      setDiagram(response.data.diagram)
      setError(null)
    } catch (err) {
      setError('Failed to load diagram')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      const response = await predictionAPI.downloadDiagram(predictionId)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `prediction_diagram_${predictionId}.png`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to download diagram')
      console.error(err)
    }
  }

  return (
    <div className="diagram-viewer-modal">
      <div className="diagram-viewer-content">
        <div className="diagram-viewer-header">
          <h2>Prediction Data Diagram</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="diagram-viewer-body">
          {loading && <div className="loading">Loading diagram...</div>}
          
          {error && <div className="alert alert-error">{error}</div>}
          
          {diagram && !loading && (
            <img 
              src={`data:image/png;base64,${diagram}`} 
              alt="Prediction Diagram"
              className="diagram-image"
            />
          )}
        </div>

        <div className="diagram-viewer-footer">
          <button 
            className="btn btn-primary"
            onClick={handleDownload}
            disabled={loading || !diagram}
          >
            Download PNG
          </button>
          <button 
            className="btn btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
