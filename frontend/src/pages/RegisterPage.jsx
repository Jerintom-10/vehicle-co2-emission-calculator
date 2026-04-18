import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import FormInput from '../components/common/FormInput'
import { validators } from '../utils/validators'
import '../styles/pages.css'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, loading, error: authError } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!validators.email(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else {
      const passErr = validators.password(formData.password)
      if (passErr) newErrors.password = passErr
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required'
    } else {
      const nameErr = validators.fullName(formData.fullName)
      if (nameErr) newErrors.fullName = nameErr
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Register
    const result = await register(formData.email, formData.password, formData.fullName)

    if (result.success) {
      navigate('/')
    }
  }

  return (
    <div className="page auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join EcoVehicle today</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <FormInput
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
              placeholder="Enter you name..."
              required
            />

            <FormInput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="Enter your email..."
              required
            />

            <FormInput
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="••••••••"
              required
            />

            <FormInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="••••••••"
              required
            />

            {authError && <div className="alert alert-error">{authError}</div>}

            <button
              type="submit"
              className="btn btn-primary btn-block btn-large"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
