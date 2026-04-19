import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { predictionAPI, reportAPI } from '../services/apiService'
import { validateVehicleData } from '../utils/validators'
import FormInput, { FormGroup } from '../components/common/FormInput'
import CarAnimation from '../components/animations/CarAnimation'
import EmissionGauge from '../components/animations/EmissionGauge'
import { getInitialVehicleSelection, getModelOptions, makeOptions } from '../data/vehicleCatalog'
import '../styles/pages.css'

/* ─── constants ─────────────────────────────────────────────── */

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
  { value: 'M5', label: 'Manual 5-spd' },
  { value: 'M6', label: 'Manual 6-spd' },
  { value: 'M7', label: 'Manual 7-spd' },
  { value: 'A4', label: 'Auto 4-spd' },
  { value: 'A5', label: 'Auto 5-spd' },
  { value: 'A6', label: 'Auto 6-spd' },
  { value: 'A7', label: 'Auto 7-spd' },
  { value: 'A8', label: 'Auto 8-spd' },
  { value: 'A9', label: 'Auto 9-spd' },
  { value: 'AS4', label: 'Sport Auto 4-spd' },
  { value: 'AS5', label: 'Sport Auto 5-spd' },
  { value: 'AS6', label: 'Sport Auto 6-spd' },
  { value: 'AS7', label: 'Sport Auto 7-spd' },
  { value: 'AS8', label: 'Sport Auto 8-spd' },
  { value: 'AS9', label: 'Sport Auto 9-spd' },
  { value: 'AM5', label: 'AMT 5-spd' },
  { value: 'AM6', label: 'AMT 6-spd' },
  { value: 'AM7', label: 'AMT 7-spd' },
  { value: 'AV', label: 'CVT' },
  { value: 'AV6', label: 'CVT 6' },
  { value: 'AV7', label: 'CVT 7' },
  { value: 'AV8', label: 'CVT 8' },
]

/* ─── helpers ───────────────────────────────────────────────── */

const initialVehicle = getInitialVehicleSelection()

const BLANK_FORM = {
  make: initialVehicle.make,
  model: initialVehicle.model,
  engineSize: '',
  cylinders: '',
  fuelConsumptionCity: '',
  fuelConsumptionHighway: '',
  fuelConsumptionCombined: '',
  fuelType: 'X',
  vehicleClass: 'COMPACT',
  transmission: 'AS6',
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

/* ─── rating config ─────────────────────────────────────────── */

const RATING_META = {
  'Very Low':   { color: '#22c55e', bg: '#f0fdf4', label: 'Very Low Emissions' },
  'Low':        { color: '#84cc16', bg: '#f7fee7', label: 'Low Emissions' },
  'Moderate':   { color: '#f59e0b', bg: '#fffbeb', label: 'Moderate Emissions' },
  'High':       { color: '#f97316', bg: '#fff7ed', label: 'High Emissions' },
  'Very High':  { color: '#ef4444', bg: '#fef2f2', label: 'Very High Emissions' },
}

/* ─── sub-components ────────────────────────────────────────── */

function StatRow({ label, value }) {
  return (
    <div className="dp-stat-row">
      <span className="dp-stat-label">{label}</span>
      <span className="dp-stat-value">{value}</span>
    </div>
  )
}

function EmptyPanel() {
  return (
    <div className="dp-empty-panel">
      <CarAnimation />
      <p className="dp-empty-hint">Results appear here after prediction</p>
    </div>
  )
}

function ResultPanel({ prediction, formSnapshot, onDownloadDiagram, onDownloadReport, downloadingDiagram, downloadingReport, downloadError, onReset }) {
  const rating = prediction.rating
  const meta = RATING_META[rating] || { color: '#6b7280', bg: '#f9fafb', label: rating }
  const co2 = prediction.predicted_co2.toFixed(1)

  return (
    <div className="dp-result-panel" style={{ '--rating-color': meta.color, '--rating-bg': meta.bg }}>
      {/* Header */}
      <div className="dp-result-header">
        <div>
          <span className="eyebrow">Result</span>
          <p className="dp-result-vehicle">{formSnapshot.make} {formSnapshot.model}</p>
        </div>
        <button className="dp-reset-btn" onClick={onReset} title="Run another prediction">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          New
        </button>
      </div>

      {/* CO₂ hero */}
      <div className="dp-co2-hero">
        <span className="dp-co2-number">{co2}</span>
        <span className="dp-co2-unit">g/km CO₂</span>
        <div className="dp-rating-badge" style={{ background: meta.bg, color: meta.color }}>
          {meta.label}
        </div>
      </div>

      {/* Gauge */}
      <div className="dp-gauge-wrap">
        <EmissionGauge co2Value={prediction.predicted_co2} rating={rating} />
      </div>

      {/* Stats */}
      <div className="dp-stats">
        <StatRow label="Vehicle class" value={prediction.vehicle.vehicle_class} />
        <StatRow label="Engine" value={`${prediction.vehicle.engine_size}L · ${prediction.vehicle.cylinders} cyl`} />
        <StatRow
          label="Consumption"
          value={`${prediction.fuel_consumption.city} / ${prediction.fuel_consumption.highway} / ${prediction.fuel_consumption.combined} L/100km`}
        />
      </div>

      {/* Diagram */}
      {prediction.diagram && (
        <div className="dp-diagram">
          <span className="eyebrow">SHAP Explanation</span>
          <img
            src={`data:image/png;base64,${prediction.diagram}`}
            alt="Prediction explanation diagram"
            className="dp-diagram-img"
          />
        </div>
      )}

      {/* Errors */}
      {downloadError && <div className="alert alert-error">{downloadError}</div>}

      {/* Actions */}
      <div className="dp-result-actions">
        <button className="btn btn-secondary" onClick={onDownloadDiagram} disabled={downloadingDiagram}>
          {downloadingDiagram ? 'Downloading…' : 'Download Diagram'}
        </button>
        <button className="btn btn-primary" onClick={onDownloadReport} disabled={downloadingReport}>
          {downloadingReport ? 'Preparing PDF…' : 'Download Report'}
        </button>
      </div>
    </div>
  )
}

/* ─── page ──────────────────────────────────────────────────── */

export default function DashboardPage() {
  const [formData, setFormData] = useState(BLANK_FORM)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [prediction, setPrediction] = useState(null)
  const [formSnapshot, setFormSnapshot] = useState(null)
  const [downloadingDiagram, setDownloadingDiagram] = useState(false)
  const [downloadingReport, setDownloadingReport] = useState(false)
  const [downloadError, setDownloadError] = useState(null)

  const modelOptions = useMemo(() => getModelOptions(formData.make), [formData.make])

  useEffect(() => {
    if (!modelOptions.some((o) => o.value === formData.model)) {
      setFormData((prev) => ({ ...prev, model: modelOptions[0]?.value || '' }))
    }
  }, [modelOptions, formData.model])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      if (name === 'make') {
        const next = getModelOptions(value)
        return { ...prev, make: value, model: next[0]?.value || '' }
      }
      return {
        ...prev,
        [name]:
          name.includes('Consumption') || name === 'engineSize'
            ? value === '' ? '' : parseFloat(value)
            : name === 'cylinders'
              ? value === '' ? '' : parseInt(value, 10)
              : value,
      }
    })
    if (errors[name] || errors.submit) {
      setErrors((prev) => ({ ...prev, [name]: null, submit: null }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validateVehicleData(formData)
    if (validationErrors) { setErrors(validationErrors); return }

    setLoading(true)
    try {
      const snap = { ...formData }
      const response = await predictionAPI.predict(formData)
      setPrediction(response.data.prediction)
      setFormSnapshot(snap)
      setErrors({})
      setDownloadError(null)
      // Reset form values (keep dropdowns at defaults for convenience)
      setFormData({
        ...BLANK_FORM,
        make: formData.make,
        model: formData.model,
        fuelType: formData.fuelType,
        vehicleClass: formData.vehicleClass,
        transmission: formData.transmission,
      })
    } catch (err) {
      let msg = 'Prediction failed. Please try again.'
      const detail = err.response?.data?.detail
      if (typeof detail === 'string') msg = detail
      else if (Array.isArray(detail)) msg = detail.map((d) => d.msg || d).join(', ')
      else if (detail) msg = JSON.stringify(detail)
      setErrors({ submit: msg })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadDiagram = async () => {
    if (!prediction?.id) return
    setDownloadingDiagram(true)
    try {
      const res = await predictionAPI.downloadDiagram(prediction.id)
      downloadBlob(res.data, `shap_diagram_${prediction.id}.png`)
    } catch {
      setDownloadError('Failed to download diagram.')
    } finally {
      setDownloadingDiagram(false)
    }
  }

  const handleDownloadReport = async () => {
    if (!prediction?.id) return
    setDownloadingReport(true)
    try {
      const res = await reportAPI.downloadPredictionReport(prediction.id)
      downloadBlob(res.data, `prediction_${prediction.id}.pdf`)
    } catch {
      setDownloadError('Failed to download report.')
    } finally {
      setDownloadingReport(false)
    }
  }

  const handleReset = () => {
    setPrediction(null)
    setFormSnapshot(null)
    setDownloadError(null)
  }

  return (
    <>
      {/* ── page styles ── */}
      <style>{`
        /* Layout */
        .dp-page { min-height: 100vh; background: var(--color-bg, #f8fafc); }
        .dp-container { max-width: 1120px; margin: 0 auto; padding: 32px 24px; }

        /* Page header */
        .dp-page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; }
        .dp-page-title { font-size: 22px; font-weight: 700; color: green; margin: 2px 0 0; letter-spacing: -0.4px; }
        .dp-page-sub { font-size: 13px; color: var(--color-text-secondary); margin: 4px 0 0; }
        .dp-nav-links { display: flex; gap: 8px; align-items: center; }

        /* 2-col grid */
        .dp-grid { display: grid; grid-template-columns: 1fr 420px; gap: 20px; align-items: start; }
        @media (max-width: 900px) { .dp-grid { grid-template-columns: 1fr; } }

        /* Card shell */
        .dp-card { background: var(--color-surface, #fff); border: 1px solid var(--color-border); border-radius: var(--radius-lg, 14px); overflow: hidden; }

        /* Form card */
        .dp-form-card { padding: 24px; }
        .dp-card-title { font-size: 14px; font-weight: 700; color: green; margin: 0 0 18px; text-transform: uppercase; letter-spacing: .06em; }

        /* Section within form */
        .dp-section { margin-bottom: 20px; }
        .dp-section-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; color: green; margin-bottom: 8px; }
        .dp-row { display: grid; gap: 10px; }
        .dp-row-2 { grid-template-columns: 1fr 1fr; }
        .dp-row-3 { grid-template-columns: 1fr 1fr 1fr; }
        @media (max-width: 600px) { .dp-row-2, .dp-row-3 { grid-template-columns: 1fr 1fr; } }

        /* Field */
        .dp-field { display: flex; flex-direction: column; gap: 4px; }
        .dp-label { font-size: 12px; font-weight: 500; color: var(--color-text-secondary); }
        .dp-input, .dp-select {
          height: 36px; padding: 0 10px; font-size: 13px; color: var(--color-text-primary);
          background: var(--color-input-bg, var(--color-bg-subtle, #f8fafc));
          border: 1px solid var(--color-border); border-radius: var(--radius-md, 8px);
          outline: none; transition: border .15s, box-shadow .15s; width: 100%; box-sizing: border-box;
          font-family: inherit;
        }
        .dp-input:focus, .dp-select:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px var(--color-primary-subtle, rgba(var(--color-primary-rgb, 15,23,42),.07));
          background: var(--color-surface);
        }
        .dp-field-error .dp-input, .dp-field-error .dp-select { border-color: var(--color-danger, #ef4444); }
        .dp-field-msg { font-size: 11px; color: var(--color-danger, #ef4444); }

        /* Divider */
        .dp-divider { border: none; border-top: 1px solid var(--color-border-subtle, var(--color-border)); margin: 20px 0; }

        /* Submit */
        .dp-submit-row { display: flex; align-items: center; gap: 12px; padding-top: 4px; }
        .dp-submit-error { font-size: 12px; color: var(--color-danger, #ef4444); }

        /* Eyebrow — reuse existing .eyebrow class from pages.css */
        .dp-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--color-text-muted); display: block; margin-bottom: 2px; }

        /* Empty panel */
        .dp-empty-panel { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 48px 24px; text-align: center; }
        .dp-empty-hint { font-size: 13px; color: var(--color-text-muted); }

        /* Result panel */
        .dp-result-panel { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
        .dp-result-header { display: flex; align-items: flex-start; justify-content: space-between; }
        .dp-result-vehicle { font-size: 16px; font-weight: 700; color: var(--color-text-primary); margin: 2px 0 0; letter-spacing: -.3px; }

        .dp-reset-btn {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 12px; font-weight: 600; color: var(--color-text-secondary);
          background: var(--color-bg-subtle, var(--color-bg)); border: 1px solid var(--color-border); border-radius: var(--radius-md, 8px);
          padding: 5px 10px; cursor: pointer; font-family: inherit; transition: all .15s;
          white-space: nowrap;
        }
        .dp-reset-btn:hover { background: var(--color-border); color: var(--color-text-primary); }

        /* CO₂ hero */
        .dp-co2-hero { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 20px; background: var(--rating-bg); border-radius: var(--radius-md, 10px); text-align: center; }
        .dp-co2-number { font-size: 52px; font-weight: 800; color: var(--rating-color); line-height: 1; letter-spacing: -2px; }
        .dp-co2-unit { font-size: 13px; color: var(--color-text-secondary); font-weight: 500; }
        .dp-rating-badge { font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 99px; margin-top: 4px; letter-spacing: .02em; }

        /* Gauge */
        .dp-gauge-wrap { display: flex; justify-content: center; }

        /* Stats */
        .dp-stats { display: flex; flex-direction: column; gap: 0; border: 1px solid var(--color-border); border-radius: var(--radius-md, 10px); overflow: hidden; }
        .dp-stat-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-bottom: 1px solid var(--color-border-subtle, var(--color-border)); gap: 12px; }
        .dp-stat-row:last-child { border-bottom: none; }
        .dp-stat-label { font-size: 12px; color: var(--color-text-secondary); flex-shrink: 0; }
        .dp-stat-value { font-size: 12px; font-weight: 600; color: var(--color-text-primary); text-align: right; }

        /* Diagram */
        .dp-diagram { display: flex; flex-direction: column; gap: 8px; }
        .dp-diagram-img { width: 100%; border-radius: var(--radius-md, 10px); border: 1px solid var(--color-border); }

        /* Result actions */
        .dp-result-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

        .dp-error { font-size: 12px; color: var(--color-danger, #ef4444); margin: 0; }
      `}</style>

      <div className="dp-page">
        <div className="dp-container">

          {/* Page header */}
          <div className="dp-page-header">
            <div>
              <h1 className="dp-page-title">
                Predict Vehicle CO<sub>2</sub> Emissions
              </h1>
              <p className="dp-page-sub">Configure a vehicle to get an instant CO₂ prediction with model explanations.</p>
            </div>
            <div className="dp-nav-links">
              <Link to="/history" className="btn btn-secondary">History</Link>
              <Link to="/reports" className="btn btn-primary">Reports</Link>
            </div>
          </div>

          {/* 2-col grid */}
          <div className="dp-grid">

            {/* ── LEFT: Form ── */}
            <div className="dp-card dp-form-card">
              <p className="dp-card-title">Vehicle Configuration</p>

              <form onSubmit={handleSubmit}>

                <div className="dp-section">
                  <p className="dp-section-label">Make &amp; Model</p>
                  <div className="dp-row dp-row-2">
                    <Field label="Make" name="make" error={errors.make}>
                      <select className="dp-select" name="make" value={formData.make} onChange={handleChange}>
                        {makeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </Field>
                    <Field label="Model" name="model" error={errors.model}>
                      <select className="dp-select" name="model" value={formData.model} onChange={handleChange} disabled={!modelOptions.length}>
                        {modelOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </Field>
                  </div>
                </div>

                <div className="dp-section">
                  <p className="dp-section-label">Class &amp; Drivetrain</p>
                  <div className="dp-row dp-row-3">
                    <Field label="Class" name="vehicleClass" error={errors.vehicleClass}>
                      <select className="dp-select" name="vehicleClass" value={formData.vehicleClass} onChange={handleChange}>
                        {VEHICLE_CLASSES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </Field>
                    <Field label="Transmission" name="transmission" error={errors.transmission}>
                      <select className="dp-select" name="transmission" value={formData.transmission} onChange={handleChange}>
                        {TRANSMISSIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </Field>
                    <Field label="Fuel Type" name="fuelType" error={errors.fuelType}>
                      <select className="dp-select" name="fuelType" value={formData.fuelType} onChange={handleChange}>
                        {FUEL_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </Field>
                  </div>
                </div>

                <div className="dp-section">
                  <p className="dp-section-label">Engine</p>
                  <div className="dp-row dp-row-2">
                    <Field label="Engine Size (L)" name="engineSize" error={errors.engineSize}>
                      <input className="dp-input" type="number" name="engineSize" value={formData.engineSize} onChange={handleChange} step="0.1" min="0.1" max="10" placeholder="e.g. 2.0" required />
                    </Field>
                    <Field label="Cylinders" name="cylinders" error={errors.cylinders}>
                      <input className="dp-input" type="number" name="cylinders" value={formData.cylinders} onChange={handleChange} min="1" max="16" placeholder="e.g. 4" required />
                    </Field>
                  </div>
                </div>

                <div className="dp-section">
                  <p className="dp-section-label">Fuel Consumption (L/100km)</p>
                  <div className="dp-row dp-row-3">
                    <Field label="City" name="fuelConsumptionCity" error={errors.fuelConsumptionCity}>
                      <input className="dp-input" type="number" name="fuelConsumptionCity" value={formData.fuelConsumptionCity} onChange={handleChange} step="0.1" min="0.1" placeholder="e.g. 9.2" required />
                    </Field>
                    <Field label="Highway" name="fuelConsumptionHighway" error={errors.fuelConsumptionHighway}>
                      <input className="dp-input" type="number" name="fuelConsumptionHighway" value={formData.fuelConsumptionHighway} onChange={handleChange} step="0.1" min="0.1" placeholder="e.g. 6.8" required />
                    </Field>
                    <Field label="Combined" name="fuelConsumptionCombined" error={errors.fuelConsumptionCombined}>
                      <input className="dp-input" type="number" name="fuelConsumptionCombined" value={formData.fuelConsumptionCombined} onChange={handleChange} step="0.1" min="0.1" placeholder="e.g. 8.1" required />
                    </Field>
                  </div>
                </div>

                <hr className="dp-divider" />

                <div className="dp-submit-row">
                  <button type="submit" className="btn btn-primary btn-large" style={{ flex: 1 }} disabled={loading}>
                    {loading ? 'Analyzing…' : 'Predict Emissions'}
                  </button>
                  {errors.submit && <span className="alert alert-error" style={{ fontSize: 12 }}>{errors.submit}</span>}
                </div>

              </form>
            </div>

            {/* ── RIGHT: Result ── */}
            <div className="dp-card">
              {prediction
                ? <ResultPanel
                    prediction={prediction}
                    formSnapshot={formSnapshot}
                    onDownloadDiagram={handleDownloadDiagram}
                    onDownloadReport={handleDownloadReport}
                    downloadingDiagram={downloadingDiagram}
                    downloadingReport={downloadingReport}
                    downloadError={downloadError}
                    onReset={handleReset}
                  />
                : <EmptyPanel />
              }
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

/* ─── tiny Field wrapper ─────────────────────────────────────── */

function Field({ label, name, error, children }) {
  return (
    <div className={`dp-field${error ? ' dp-field-error' : ''}`}>
      <label className="dp-label" htmlFor={name}>{label}</label>
      {children}
      {error && <span className="dp-field-msg">{error}</span>}
    </div>
  )
}