from typing import Optional
from datetime import datetime

class User:
    """User model"""
    
    def __init__(
        self,
        email: str,
        password_hash: str,
        full_name: str,
        is_admin: bool = False,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
        _id: Optional[str] = None
    ):
        self._id = _id
        self.email = email
        self.password_hash = password_hash
        self.full_name = full_name
        self.is_admin = is_admin
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            "_id": self._id,
            "email": self.email,
            "full_name": self.full_name,
            "is_admin": self.is_admin,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
    
    def to_dict_with_password(self):
        """Convert to dictionary with password hash"""
        data = self.to_dict()
        data["password_hash"] = self.password_hash
        return data

class Prediction:
    """Vehicle emission prediction model"""
    
    def __init__(
        self,
        user_id: str,
        engine_size: float,
        cylinders: int,
        fuel_consumption_city: float,
        fuel_consumption_highway: float,
        fuel_consumption_combined: float,
        fuel_type: str,
        vehicle_class: str,
        transmission: str,
        predicted_co2: float,
        rating: str,
        shap_values: Optional[dict] = None,
        created_at: Optional[datetime] = None,
        _id: Optional[str] = None
    ):
        self._id = _id
        self.user_id = user_id
        self.engine_size = engine_size
        self.cylinders = cylinders
        self.fuel_consumption_city = fuel_consumption_city
        self.fuel_consumption_highway = fuel_consumption_highway
        self.fuel_consumption_combined = fuel_consumption_combined
        self.fuel_type = fuel_type
        self.vehicle_class = vehicle_class
        self.transmission = transmission
        self.predicted_co2 = predicted_co2
        self.rating = rating
        self.shap_values = shap_values or {}
        self.created_at = created_at or datetime.utcnow()
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            "_id": self._id,
            "user_id": self.user_id,
            "engine_size": self.engine_size,
            "cylinders": self.cylinders,
            "fuel_consumption_city": self.fuel_consumption_city,
            "fuel_consumption_highway": self.fuel_consumption_highway,
            "fuel_consumption_combined": self.fuel_consumption_combined,
            "fuel_type": self.fuel_type,
            "vehicle_class": self.vehicle_class,
            "transmission": self.transmission,
            "predicted_co2": self.predicted_co2,
            "rating": self.rating,
            "shap_values": self.shap_values,
            "created_at": self.created_at
        }
