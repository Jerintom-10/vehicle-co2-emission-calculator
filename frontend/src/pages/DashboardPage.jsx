import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { predictionAPI, reportAPI } from '../services/apiService'
import { validateVehicleData } from '../utils/validators'
import FormInput, { FormGroup } from '../components/common/FormInput'
import CarAnimation from '../components/animations/CarAnimation'
import EmissionGauge from '../components/animations/EmissionGauge'
import { getInitialVehicleSelection, getModelOptions, makeOptions } from '../data/vehicleCatalog'
import '../styles/pages.css'

const FUEL_TYPES = [
  { value: 'X', label: 'Petrol' },
  { value: 'Z', label: 'Premium Petrol' },
  { value: 'D', label: 'Diesel' },
  { value: 'E', label: 'Ethanol / Flex Fuel' },
  { value: 'N', label: 'CNG / Natural Gas' },
]

const VEHICLE_CLASSES = [
  { value: 'COMPACT', label: 'Compact' },
  { value: 'SUBCOMPACT', label: 'Subcompact' },
  { value: 'MID-SIZE', label: 'Mid-size' },
  { value: 'FULL-SIZE', label: 'Full-size' },
  { value: 'TWO-SEATER', label: 'Two-seater' },
  { value: 'SUV - SMALL', label: 'SUV - Small' },
  { value: 'SUV - STANDARD', label: 'SUV - Standard' },
  { value: 'PICKUP TRUCK - SMALL', label: 'Pickup Truck - Small' },
  { value: 'PICKUP TRUCK - STANDARD', label: 'Pickup Truck - Standard' },
  { value: 'VAN - PASSENGER', label: 'Van - Passenger' },
  { value: 'VAN - CARGO', label: 'Van - Cargo' },
  { value: 'MINIVAN', label: 'Minivan' },
  { value: 'STATION WAGON - SMALL', label: 'Station Wagon - Small' },
  { value: 'STATION WAGON - MID-SIZE', label: 'Station Wagon - Mid-size' },
]

const TRANSMISSIONS = [
  { value: 'M5', label: 'Manual (5)' },
  { value: 'M6', label: 'Manual (6)' },
  { value: 'M7', label: 'Manual (7)' },
  { value: 'A4', label: 'Automatic (4)' },
  { value: 'A5', label: 'Automatic (5)' },
  { value: 'A6', label: 'Automatic (6)' },
  { value: 'A7', label: 'Automatic (7)' },
  { value: 'A8', label: 'Automatic (8)' },
  { value: 'A9', label: 'Automatic (9)' },
  { value: 'AS4', label: 'Sport Automatic (4)' },
  { value: 'AS5', label: 'Sport Automatic (5)' },
  { value: 'AS6', label: 'Sport Automatic (6)' },
  { value: 'AS7', label: 'Sport Automatic (7)' },
  { value: 'AS8', label: 'Sport Automatic (8)' },
  { value: 'AS9', label: 'Sport Automatic (9)' },
  { value: 'AM5', label: 'Automated Manual (5)' },
  { value: 'AM6', label: 'Automated Manual (6)' },
  { value: 'AM7', label: 'Automated Manual (7)' },
  { value: 'AV', label: 'CVT' },
  { value: 'AV6', label: 'CVT (6)' },
  { value: 'AV7', label: 'CVT (7)' },
  { value: 'AV8', label: 'CVT (8)' },
]

const initialVehicle = getInitialVehicleSelection()

export default function DashboardPage() {
  const [formData, setFormData] = useState({
    make: initialVehicle.make,
    model: initialVehicle.model,
    engineSize: 0,
    cylinders: 0,
    fuelConsumptionCity: 0,
    fuelConsumptionHighway: 0,
    fuelConsumptionCombined: 0,
    fuelType: 'X',
    vehicleClass: 'COMPACT',
    transmission: 'AS6',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [prediction, setPrediction] = useState(null)
  const [downloadingDiagram, setDownloadingDiagram] = useState(false)
  const [downloadingReport, setDownloadingReport] = useState(false)

  const modelOptions = useMemo(() => getModelOptions(formData.make), [formData.make])

  useEffect(() => {
    if (!modelOptions.some((option) => option.value === formData.model)) {
      setFormData((prev) => ({
        ...prev,
        model: modelOptions[0]?.value || '',
      }))
    }
  }, [modelOptions, formData.model])

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => {
      if (name === 'make') {
        const nextModels = getModelOptions(value)
        return {
          ...prev,
          make: value,
          model: nextModels[0]?.value || '',
        }
      }

      return {
        ...prev,
        [name]:
          name.includes('Consumption') || name === 'engineSize'
            ? parseFloat(value)
            : name === 'cylinders'
              ? parseInt(value, 10)
              : value,
      }
    })

    if (errors[name] || errors.submit || errors.download) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
        submit: null,
        download: null,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationErrors = validateVehicleData(formData)
    if (validationErrors) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      const response = await predictionAPI.predict(formData)
      setPrediction(response.data.prediction)
      setErrors({})
    } catch (err) {
      let errorMsg = 'Prediction failed'

      if (err.response?.data?.detail) {
        const detail = err.response.data.detail
        if (typeof detail === 'string') {
          errorMsg = detail
        } else if (Array.isArray(detail)) {
          errorMsg = detail.map((item) => item.msg || item).join(', ')
        } else if (typeof detail === 'object') {
          errorMsg = JSON.stringify(detail)
        }
      }

      setErrors({ submit: errorMsg })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadDiagram = async () => {
    if (!prediction?.id) return

    setDownloadingDiagram(true)
    try {
      const response = await predictionAPI.downloadDiagram(prediction.id)
      downloadBlob(response.data, `shap_diagram_${prediction.id}.png`)
    } catch (err) {
      setErrors({ download: 'Failed to download diagram' })
    } finally {
      setDownloadingDiagram(false)
    }
  }

  const handleDownloadReport = async () => {
    if (!prediction?.id) return

    setDownloadingReport(true)
    try {
      const response = await reportAPI.downloadPredictionReport(prediction.id)
      downloadBlob(response.data, `prediction_${prediction.id}.pdf`)
    } catch (err) {
      setErrors({ download: 'Failed to download report' })
    } finally {
      setDownloadingReport(false)
    }
  }

  return (
    <div className="page dashboard-page predict-page">
      <div className="page-container">
        <div className="page-header predict-header">
          <div>
            <span className="eyebrow">Prediction studio</span>
            <h1 className="page-title page-title-left">Predict Vehicle CO<sub>2</sub> Emissions</h1>
            <p className="page-subtitle">
              Configure the vehicle first, then review the result in a dedicated results view below.
            </p>
          </div>
          <div className="action-row">
            <Link to="/history" className="btn btn-secondary">
              View History
            </Link>
            <Link to="/reports" className="btn btn-ghost">
              Open Reports
            </Link>
          </div>
        </div>

        <section className="predict-shell">
          <div className="form-section-card predict-form-card">
            <div className="predict-card-head">
              <div>
                <span className="eyebrow">Input</span>
                <h2 className="card-title card-title-no-border">Vehicle Configuration</h2>
              </div>
              <div className="predict-helper">
                Pick the make and model first so the form stays grounded in supported vehicle data.
              </div>
            </div>

            <form onSubmit={handleSubmit} className="dashboard-form">
              <FormGroup title="Make and model">
                <div className="form-row">
                  <div className="form-col">
                    <FormInput
                      label="Make"
                      name="make"
                      type="select"
                      value={formData.make}
                      onChange={handleChange}
                      error={errors.make}
                      options={makeOptions}
                      required
                    />
                  </div>
                  <div className="form-col">
                    <FormInput
                      label="Model"
                      name="model"
                      type="select"
                      value={formData.model}
                      onChange={handleChange}
                      error={errors.model}
                      options={modelOptions}
                      disabled={!modelOptions.length}
                      required
                    />
                  </div>
                </div>
              </FormGroup>

              <FormGroup title="Class and drivetrain">
                <div className="form-row">
                  <div className="form-col">
                    <FormInput
                      label="Vehicle Class"
                      name="vehicleClass"
                      type="select"
                      value={formData.vehicleClass}
                      onChange={handleChange}
                      error={errors.vehicleClass}
                      options={VEHICLE_CLASSES}
                      required
                    />
                  </div>
                  <div className="form-col">
                    <FormInput
                      label="Transmission"
                      name="transmission"
                      type="select"
                      value={formData.transmission}
                      onChange={handleChange}
                      error={errors.transmission}
                      options={TRANSMISSIONS}
                      required
                    />
                  </div>
                  <div className="form-col">
                    <FormInput
                      label="Fuel Type"
                      name="fuelType"
                      type="select"
                      value={formData.fuelType}
                      onChange={handleChange}
                      error={errors.fuelType}
                      options={FUEL_TYPES}
                      required
                    />
                  </div>
                </div>
              </FormGroup>

              <FormGroup title="Engine">
                <div className="form-row">
                  <div className="form-col">
                    <FormInput
                      label="Engine Size (L)"
                      name="engineSize"
                      type="number"
                      value={formData.engineSize}
                      onChange={handleChange}
                      error={errors.engineSize}
                      step="0.1"
                      min="0.1"
                      max="10"
                      required
                    />
                  </div>
                  <div className="form-col">
                    <FormInput
                      label="Cylinders"
                      name="cylinders"
                      type="number"
                      value={formData.cylinders}
                      onChange={handleChange}
                      error={errors.cylinders}
                      min="1"
                      max="16"
                      required
                    />
                  </div>
                </div>
              </FormGroup>

              <FormGroup title="Fuel consumption (L/100km)">
                <div className="form-row">
                  <div className="form-col">
                    <FormInput
                      label="City"
                      name="fuelConsumptionCity"
                      type="number"
                      value={formData.fuelConsumptionCity}
                      onChange={handleChange}
                      error={errors.fuelConsumptionCity}
                      step="0.1"
                      min="0.1"
                      required
                    />
                  </div>
                  <div className="form-col">
                    <FormInput
                      label="Highway"
                      name="fuelConsumptionHighway"
                      type="number"
                      value={formData.fuelConsumptionHighway}
                      onChange={handleChange}
                      error={errors.fuelConsumptionHighway}
                      step="0.1"
                      min="0.1"
                      required
                    />
                  </div>
                  <div className="form-col">
                    <FormInput
                      label="Combined"
                      name="fuelConsumptionCombined"
                      type="number"
                      value={formData.fuelConsumptionCombined}
                      onChange={handleChange}
                      error={errors.fuelConsumptionCombined}
                      step="0.1"
                      min="0.1"
                      required
                    />
                  </div>
                </div>
              </FormGroup>

              {errors.submit && <div className="alert alert-error">{errors.submit}</div>}

              <div className="predict-submit-row">
                <button
                  type="submit"
                  className="btn btn-primary btn-large"
                  disabled={loading}
                >
                  {loading ? 'Analyzing vehicle...' : 'Predict Emissions'}
                </button>
              </div>
            </form>
          </div>

          {!prediction ? (
            <section className="result-section-card predict-empty-card">
              <div className="predict-empty-top">
                <div>
                  <span className="eyebrow">Result view</span>
                  <h2 className="card-title card-title-no-border">Waiting for your first run</h2>
                  <p className="page-subtitle">
                    Once you submit the form, the prediction appears here in a focused result layout with exports.
                  </p>
                </div>
              </div>
              <CarAnimation />
            </section>
          ) : (
            <section className="result-section-card predict-result-card">
              <div className="predict-card-head">
                <div>
                  <span className="eyebrow">Result</span>
                  <h2 className="card-title card-title-no-border">Prediction Summary</h2>
                </div>
                <div className="predict-highlight">
                  <strong>{prediction.predicted_co2.toFixed(1)}</strong>
                  <span>g/km</span>
                </div>
              </div>

              <div className="predict-result-grid">
                <div className="predict-gauge-panel">
                  <EmissionGauge
                    co2Value={prediction.predicted_co2}
                    rating={prediction.rating}
                  />
                  <div className={`rating-pill rating-pill-${prediction.rating.toLowerCase().replace(/\s+/g, '-')}`}>
                    {prediction.rating}
                  </div>
                </div>

                <div className="predict-summary-panel">
                  <div className="result-details result-details-tight">
                    <div className="result-item">
                      <span className="result-label">Make and model</span>
                      <span className="result-value">{formData.make} {formData.model}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Vehicle Class</span>
                      <span className="result-value">{prediction.vehicle.vehicle_class}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Engine</span>
                      <span className="result-value">{prediction.vehicle.engine_size}L / {prediction.vehicle.cylinders} cyl</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Fuel Profile</span>
                      <span className="result-value">
                        C {prediction.fuel_consumption.city} / H {prediction.fuel_consumption.highway} / Comb {prediction.fuel_consumption.combined}
                      </span>
                    </div>
                  </div>

                  {errors.download && <div className="alert alert-error">{errors.download}</div>}

                  <div className="action-row">
                    <button
                      className="btn btn-secondary"
                      onClick={handleDownloadDiagram}
                      disabled={downloadingDiagram}
                    >
                      {downloadingDiagram ? 'Downloading PNG...' : 'Download Diagram'}
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleDownloadReport}
                      disabled={downloadingReport}
                    >
                      {downloadingReport ? 'Preparing PDF...' : 'Download Report'}
                    </button>
                  </div>
                </div>
              </div>

              {prediction.diagram && (
                <div className="predict-diagram-block">
                  <div className="predict-diagram-head">
                    <span className="eyebrow">Visual evidence</span>
                    <h3>Model explanation diagram</h3>
                  </div>
                  <img
                    src={`data:image/png;base64,${prediction.diagram}`}
                    alt="Prediction Diagram"
                    className="result-diagram"
                  />
                </div>
              )}
            </section>
          )}
        </section>
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
