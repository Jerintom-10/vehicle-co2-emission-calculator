import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { predictionAPI, reportAPI } from '../services/apiService'
import DiagramViewer from '../components/DiagramViewer'
import ComparisonChartViewer from '../components/ComparisonChartViewer'
import { formatIndiaDateTime } from '../utils/dateTime'
import '../styles/pages.css'

export default function HistoryPage() {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statistics, setStatistics] = useState(null)
  const [selectedDiagramId, setSelectedDiagramId] = useState(null)
  const [showComparisonChart, setShowComparisonChart] = useState(false)
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    fetchPageData()
  }, [])

  const latestPrediction = useMemo(() => predictions[0] || null, [predictions])

  const fetchPageData = async () => {
    setLoading(true)
    try {
      const [historyResponse, statsResponse] = await Promise.all([
        predictionAPI.getHistory(),
        predictionAPI.getStatistics(),
      ])

      setPredictions(historyResponse.data.predictions || [])
      setStatistics(statsResponse.data.statistics || null)
      setError(null)
    } catch (err) {
      let errorMsg = 'Failed to load prediction history'
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail
        errorMsg = typeof detail === 'string' ? detail : errorMsg
      }
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (predictionId) => {
    if (!window.confirm('Delete this prediction from your history?')) return

    setBusyId(predictionId)
    try {
      await predictionAPI.deletePrediction(predictionId)
      const remaining = predictions.filter((prediction) => prediction._id !== predictionId)
      setPredictions(remaining)
      setStatistics((prev) => {
        if (!prev) return prev
        if (!remaining.length) {
          return {
            total_predictions: 0,
            average_co2: 0,
            highest_co2: 0,
            lowest_co2: 0,
            rating_distribution: {},
          }
        }
        const co2 = remaining.map((prediction) => prediction.predicted_co2)
        return {
          ...prev,
          total_predictions: remaining.length,
          average_co2: co2.reduce((sum, value) => sum + value, 0) / remaining.length,
          highest_co2: Math.max(...co2),
          lowest_co2: Math.min(...co2),
        }
      })
    } catch (err) {
      setError('Failed to delete prediction')
    } finally {
      setBusyId(null)
    }
  }

  const handleDownloadReport = async (predictionId) => {
    setBusyId(predictionId)
    try {
      const response = await reportAPI.downloadPredictionReport(predictionId)
      downloadBlob(response.data, `prediction_${predictionId}.pdf`)
    } catch (err) {
      setError('Failed to download report')
    } finally {
      setBusyId(null)
    }
  }

  const handleDownloadDiagram = async (predictionId) => {
    setBusyId(predictionId)
    try {
      const response = await predictionAPI.downloadDiagram(predictionId)
      downloadBlob(response.data, `prediction_diagram_${predictionId}.png`)
    } catch (err) {
      setError('Failed to download diagram')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="page history-page">
      <div className="page-container">
        <div className="page-header">
          <div>
            <span className="eyebrow">Prediction archive</span>
            <h1 className="page-title page-title-left">History and trends</h1>
            <p className="page-subtitle">
              Review past runs, inspect diagrams, and export records as reports.
            </p>
          </div>
          <div className="action-row">
            <Link to="/predict" className="btn btn-secondary">
              New Prediction
            </Link>
            {predictions.length > 0 && (
              <button className="btn btn-primary" onClick={() => setShowComparisonChart(true)}>
                View Analysis Chart
              </button>
            )}
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {loading && <div className="loading">Loading predictions...</div>}

        {!loading && statistics && (
          <div className="statistics-grid">
            <div className="stat-card">
              <div className="stat-label">Total Predictions</div>
              <div className="stat-value">{statistics.total_predictions}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Average CO2</div>
              <div className="stat-value">{statistics.average_co2?.toFixed(1) || '0.0'}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Highest CO2</div>
              <div className="stat-value">{statistics.highest_co2?.toFixed(1) || '0.0'}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Lowest CO2</div>
              <div className="stat-value">{statistics.lowest_co2?.toFixed(1) || '0.0'}</div>
            </div>
          </div>
        )}

        {!loading && latestPrediction && (
          <section className="spotlight-card">
            <div>
              <span className="eyebrow">Latest result</span>
              <h2>{latestPrediction.make} {latestPrediction.model}</h2>
              <p className="spotlight-copy">
                {latestPrediction.vehicle_class} • {latestPrediction.engine_size}L • {latestPrediction.cylinders} cyl
              </p>
            </div>
            <div className="spotlight-metric">
              <strong>{latestPrediction.predicted_co2.toFixed(1)}</strong>
              <span>g/km</span>
            </div>
            <div className={`rating-pill rating-pill-${toClassName(latestPrediction.rating)}`}>
              {latestPrediction.rating}
            </div>
          </section>
        )}

        {!loading && predictions.length === 0 && (
          <div className="empty-state empty-card">
            <p>No predictions yet. Run your first emission estimate to start building history.</p>
            <Link to="/predict" className="btn btn-primary">
              Create First Prediction
            </Link>
          </div>
        )}

        {!loading && predictions.length > 0 && (
          <div className="history-grid">
            {predictions.map((prediction) => (
              <article key={prediction._id} className="history-card">
                <div className="history-card-top">
                  <div>
                    <h3>{prediction.make} {prediction.model}</h3>
                    <p>{formatIndiaDateTime(prediction.created_at)}</p>
                  </div>
                  <span className={`rating-pill rating-pill-${toClassName(prediction.rating)}`}>
                    {prediction.rating}
                  </span>
                </div>

                <div className="history-metrics">
                  <div>
                    <span>Predicted CO2</span>
                    <strong>{prediction.predicted_co2.toFixed(1)} g/km</strong>
                  </div>
                  <div>
                    <span>Vehicle</span>
                    <strong>{prediction.vehicle_class}</strong>
                  </div>
                  <div>
                    <span>Powertrain</span>
                    <strong>{prediction.engine_size}L / {prediction.cylinders} cyl</strong>
                  </div>
                </div>

                <div className="history-actions">
                  <button className="btn btn-ghost" onClick={() => setSelectedDiagramId(prediction._id)}>
                    View Diagram
                  </button>
                  <button
                    className="btn btn-ghost"
                    onClick={() => handleDownloadDiagram(prediction._id)}
                    disabled={busyId === prediction._id}
                  >
                    PNG
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleDownloadReport(prediction._id)}
                    disabled={busyId === prediction._id}
                  >
                    PDF Report
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(prediction._id)}
                    disabled={busyId === prediction._id}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {selectedDiagramId && (
        <DiagramViewer
          predictionId={selectedDiagramId}
          onClose={() => setSelectedDiagramId(null)}
        />
      )}

      {showComparisonChart && (
        <ComparisonChartViewer onClose={() => setShowComparisonChart(false)} />
      )}
    </div>
  )
}

function toClassName(value = '') {
  return value.toLowerCase().replace(/\s+/g, '-')
}

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(new Blob([blob]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.parentNode.removeChild(link)
  window.URL.revokeObjectURL(url)
}
