// Validation utilities

import { VALID_VEHICLE_CLASSES } from "../data/data"

export const validators = {
  email: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  },

  password: (password) => {
    if (password.length < 8) return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(password)) return 'Password must contain uppercase letter'
    if (!/[0-9]/.test(password)) return 'Password must contain digit'
    if (!/[!@#$%^&*()-_=+[\]{}|;:',.<>?/]/.test(password))
      return 'Password must contain special character'
    return null
  },

  fullName: (name) => {
    if (name.trim().length < 2) return 'Full name must be at least 2 characters'
    return null
  },

  engineSize: (size) => {
    if (size <= 0 || size > 10) return 'Engine size must be between 0.1 and 10 L'
    return null
  },

  cylinders: (cyl) => {
    if (cyl < 1 || cyl > 16) return 'Cylinders must be between 1 and 16'
    return null
  },

  fuelConsumption: (consumption, field = 'Fuel consumption') => {
    if (consumption <= 0 || consumption > 100)
      return `${field} must be between 0.1 and 100 L/100km`
    return null
  },

  vehicleClass: (vClass) => {
    const valid = VALID_VEHICLE_CLASSES;
    if (!valid.includes(vClass.toUpperCase()))
      return `Vehicle class must be one of: ${valid.join(', ')}`
    return null
  },

  fuelType: (fuelType) => {
    const valid = ['X', 'Z', 'D', 'E', 'N'];
    if (!valid.includes(fuelType.toUpperCase()))
      return `Fuel type must be one of: ${valid.join(', ')}`
    return null
  },

  textField: (value, fieldName = 'Field', minLength = 2) => {
    if (value.trim().length < minLength)
      return `${fieldName} must be at least ${minLength} characters`
    return null
  },
}

export const validateVehicleData = (data) => {
  const errors = {}

  const makeErr = validators.textField(data.make || '', 'Make', 1)
  if (makeErr) errors.make = makeErr

  const modelErr = validators.textField(data.model || '', 'Model', 1)
  if (modelErr) errors.model = modelErr

  const engineSizeErr = validators.engineSize(data.engineSize)
  if (engineSizeErr) errors.engineSize = engineSizeErr

  const cylindersErr = validators.cylinders(data.cylinders)
  if (cylindersErr) errors.cylinders = cylindersErr

  const fuelCityErr = validators.fuelConsumption(data.fuelConsumptionCity, 'City fuel consumption')
  if (fuelCityErr) errors.fuelConsumptionCity = fuelCityErr

  const fuelHwyErr = validators.fuelConsumption(data.fuelConsumptionHighway, 'Highway fuel consumption')
  if (fuelHwyErr) errors.fuelConsumptionHighway = fuelHwyErr

  const fuelCombErr = validators.fuelConsumption(data.fuelConsumptionCombined, 'Combined fuel consumption')
  if (fuelCombErr) errors.fuelConsumptionCombined = fuelCombErr

  const classErr = validators.vehicleClass(data.vehicleClass)
  if (classErr) errors.vehicleClass = classErr

  const fuelErr = validators.fuelType(data.fuelType)
  if (fuelErr) errors.fuelType = fuelErr

  const transErr = validators.textField(data.transmission || '', 'Transmission', 1)
  if (transErr) errors.transmission = transErr

  return Object.keys(errors).length === 0 ? null : errors
}
