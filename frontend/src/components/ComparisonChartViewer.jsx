import React, { useState, useEffect } from 'react'
import { predictionAPI } from '../services/apiService'
import './ComparisonChartViewer.css'

export default function ComparisonChartViewer({ onClose }) {
  const [chart, setChart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalPredictions, setTotalPredictions] = useState(0)

  useEffect(() => {
    fetchChart()
  }, [])

  const fetchChart = async () => {
    try {
      setLoading(true)
      const response = await predictionAPI.getComparisonChart()
      setChart(response.data.chart)
      setTotalPredictions(response.data.total_predictions)
      setError(null)
    } catch (err) {
      setError('Failed to load comparison chart')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      const response = await predictionAPI.downloadComparisonChart()
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'prediction_comparison_chart.png')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to download chart')
      console.error(err)
    }
  }

  return (
    <div className="comparison-viewer-modal">
      <div className="comparison-viewer-content">
        <div className="comparison-viewer-header">
          <h2>Prediction History Analysis</h2>
          <div className="chart-info">
            Total Predictions: <strong>{totalPredictions}</strong>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="comparison-viewer-body">
          {loading && <div className="loading">Loading chart...</div>}
          
          {error && <div className="alert alert-error">{error}</div>}
          
          {chart && !loading && (
            <img 
              src={`data:image/png;base64,${chart}`} 
              alt="Comparison Chart"
              className="chart-image"
            />
          )}
        </div>

        <div className="comparison-viewer-footer">
          <button 
            className="btn btn-primary"
            onClick={handleDownload}
            disabled={loading || !chart}
          >
            Download Chart (PNG)
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
