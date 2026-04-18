import React from 'react'
import { theme } from '../../styles/theme'
import './FormInput.css'

export default function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required,
  options = [],
  ...props
}) {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}

      {type === 'select' ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`form-input ${error ? 'error' : ''}`}
          {...props}
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`form-input ${error ? 'error' : ''}`}
          {...props}
        />
      ) : (
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`form-input ${error ? 'error' : ''}`}
          {...props}
        />
      )}

      {error && <span className="form-error">{error}</span>}
    </div>
  )
}

export function FormGroup({ children, title }) {
  return (
    <div className="form-section">
      {title && <h3 className="form-section-title">{title}</h3>}
      <div className="form-section-content">{children}</div>
    </div>
  )
}

// Add this to your global CSS
const formStyles = `
.form-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
  font-size: 14px;
}

.required {
  color: var(--error);
  margin-left: 4px;
}

.form-input {
  padding: 12px 16px;
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 200ms ease;
  background-color: white;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
}

.form-input.error {
  border-color: var(--error);
}

.form-input.error:focus {
  box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1);
}

.form-error {
  color: var(--error);
  font-size: 12px;
  margin-top: 6px;
  font-weight: 500;
}

.form-section {
  margin-bottom: 30px;
}

.form-section-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--border);
}

.form-section-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
`
