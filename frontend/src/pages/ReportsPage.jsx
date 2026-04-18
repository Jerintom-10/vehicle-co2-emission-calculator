import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { predictionAPI, reportAPI } from '../services/apiService'
import { formatIndiaDate, formatIndiaDateTime } from '../utils/dateTime'
import '../styles/pages.css'

export default function ReportsPage() {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busyKey, setBusyKey] = useState(null)

  useEffect(() => {
    fetchPredictions()
  }, [])

  const fetchPredictions = async () => {
    setLoading(true)
    try {
      const response = await predictionAPI.getHistory(20)
      setPredictions(response.data.predictions || [])
      setError(null)
    } catch (err) {
      setError('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadHistoryReport = async () => {
    setBusyKey('history')
    try {
      const response = await reportAPI.downloadHistoryReport()
      downloadBlob(response.data, 'ecovehicle_history_report.pdf')
    } catch (err) {
      setError('Failed to download history report')
    } finally {
      setBusyKey(null)
    }
  }

  const handleDownloadPredictionReport = async (predictionId) => {
    setBusyKey(predictionId)
    try {
      const response = await reportAPI.downloadPredictionReport(predictionId)
      downloadBlob(response.data, `prediction_${predictionId}.pdf`)
    } catch (err) {
      setError('Failed to download prediction report')
    } finally {
      setBusyKey(null)
    }
  }

  return (
    <div className="page reports-page">
      <div className="page-container">
        <div className="page-header">
          <div>
            <span className="eyebrow">Reporting hub</span>
            <h1 className="page-title page-title-left">Reports</h1>
            <p className="page-subtitle">
              Export individual prediction reports or generate a consolidated PDF for your full history.
            </p>
          </div>
          <Link to="/predict" className="btn btn-secondary">
            Back to Predictor
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {loading && <div className="loading">Loading reports...</div>}

        {!loading && (
          <>
            <section className="reports-hero">
              <div className="reports-hero-card">
                <span className="eyebrow">Complete export</span>
                <h2>Download the full history report</h2>
                <p>
                  Build a single PDF containing your prediction archive, summary statistics,
                  and trend snapshots for sharing or record keeping.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={handleDownloadHistoryReport}
                  disabled={busyKey === 'history' || predictions.length === 0}
                >
                  {busyKey === 'history' ? 'Preparing PDF...' : 'Download History Report'}
                </button>
              </div>
              <div className="reports-summary-card">
                <div>
                  <span>Total Saved Predictions</span>
                  <strong>{predictions.length}</strong>
                </div>
                <div>
                  <span>Latest Run</span>
                  <strong>{predictions[0] ? formatIndiaDate(predictions[0].created_at) : 'No history yet'}</strong>
                </div>
              </div>
            </section>

            {predictions.length === 0 ? (
              <div className="empty-state empty-card">
                <p>No reports yet because there are no saved predictions in your account.</p>
                <Link to="/predict" className="btn btn-primary">
                  Run a Prediction
                </Link>
              </div>
            ) : (
              <section className="report-list">
                {predictions.map((prediction) => (
                  <article key={prediction._id} className="report-card">
                    <div>
                      <h3>{prediction.make} {prediction.model}</h3>
                      <p>
                        {prediction.vehicle_class} • {prediction.engine_size}L • {prediction.cylinders} cyl
                      </p>
                      <small>{formatIndiaDateTime(prediction.created_at)}</small>
                    </div>
                    <div className="report-card-side">
                      <strong>{prediction.predicted_co2.toFixed(1)} g/km</strong>
                      <span>{prediction.rating}</span>
                    </div>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleDownloadPredictionReport(prediction._id)}
                      disabled={busyKey === prediction._id}
                    >
                      {busyKey === prediction._id ? 'Preparing...' : 'Download PDF'}
                    </button>
                  </article>
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
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
