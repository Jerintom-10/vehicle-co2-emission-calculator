import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import CarAnimation from '../components/animations/CarAnimation'
import '../styles/pages.css'

const platformHighlights = [
  {
    title: 'Data-driven vehicle selector',
    description: 'Browse makes and models from the built-in catalog, including added Indian market brands for a better UI experience.',
  },
  {
    title: 'Prediction history',
    description: 'Keep every run in one place with quick access to diagrams, report exports, and trend views.',
  },
  {
    title: 'Report exports',
    description: 'Download polished PDF reports for individual predictions or your complete account history.',
  },
]

const workflow = [
  'Choose a vehicle make, model, and configuration.',
  'Run the prediction engine and inspect the emissions result.',
  'Download diagrams and reports or compare runs over time.',
]

export default function HomePage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="page home-page landing-page">
      <div className="page-container">
        <section className="hero-section hero-panel">
          <div className="hero-content">
            <span className="eyebrow">A full vehicle emissions workspace</span>
            <h1 className="hero-title">Predict, track, and report vehicle CO2 from one platform.</h1>
            <p className="hero-subtitle">
              EcoVehicle now starts with a real landing page at `/`, then carries you into prediction,
              history, and reporting without hiding the useful parts of the product behind a dead-end login flow.
            </p>

            <div className="hero-cta">
              {isAuthenticated ? (
                <>
                  <Link to="/predict" className="btn btn-primary btn-large">
                    Start Predicting
                  </Link>
                  <Link to="/reports" className="btn btn-secondary btn-large">
                    Open Reports
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-large">
                    Create Account
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-large">
                    Sign In
                  </Link>
                </>
              )}
            </div>

            <div className="hero-trust-strip">
              <span>Prediction engine</span>
              <span>Saved history</span>
              <span>PDF exports</span>
            </div>
          </div>

          <div className="hero-visual-shell">
            <CarAnimation />
          </div>
        </section>

        <section className="features-section">
          <div className="section-heading">
            <span className="eyebrow">Platform pillars</span>
            <h2>Built to be usable end to end</h2>
          </div>
          <div className="features-grid">
            {platformHighlights.map((item) => (
              <article key={item.title} className="feature-card feature-card-left">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="info-section landing-split">
          <div className="landing-checklist">
            <span className="eyebrow">How it works</span>
            <h2>From estimate to export in a few steps</h2>
            <div className="workflow-list">
              {workflow.map((step, index) => (
                <div key={step} className="workflow-item">
                  <div className="step-number">{index + 1}</div>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="landing-aside-card">
            <span className="eyebrow">Ready when you are</span>
            <h3>Use the predictor as the engine, not the homepage</h3>
            <p>
              The landing page stays public at `/`, while the working areas stay protected and focused:
              predictor, history, and reports.
            </p>
            <div className="action-row">
              <Link to="/predict" className="btn btn-primary">
                Predictor
              </Link>
              <Link to="/history" className="btn btn-secondary">
                History
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
