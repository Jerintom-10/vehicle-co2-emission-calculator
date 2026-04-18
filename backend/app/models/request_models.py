from typing import Optional
from datetime import datetime

# Register/Login Schemas
class UserRegister:
    """User registration data"""
    def __init__(self, email: str, password: str, full_name: str):
        self.email = email
        self.password = password
        self.full_name = full_name

class UserLogin:
    """User login data"""
    def __init__(self, email: str, password: str):
        self.email = email
        self.password = password

# Prediction Schemas
class VehicleData:
    """Vehicle data for prediction"""
    def __init__(
        self,
        make: str,
        model: str,
        engine_size: float,
        cylinders: int,
        fuel_consumption_city: float,
        fuel_consumption_highway: float,
        fuel_consumption_combined: float,
        fuel_type: str,
        vehicle_class: str,
        transmission: str,
    ):
        self.make = make
        self.model = model
        self.engine_size = engine_size
        self.cylinders = cylinders
        self.fuel_consumption_city = fuel_consumption_city
        self.fuel_consumption_highway = fuel_consumption_highway
        self.fuel_consumption_combined = fuel_consumption_combined
        self.fuel_type = fuel_type
        self.vehicle_class = vehicle_class
        self.transmission = transmission

class PredictionResponse:
    """Prediction response data"""
    def __init__(
        self,
        predicted_co2: float,
        rating: str,
        confidence: float,
        shap_values: dict
    ):
        self.predicted_co2 = predicted_co2
        self.rating = rating
        self.confidence = confidence
        self.shap_values = shap_values
