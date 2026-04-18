from typing import Tuple
from email_validator import validate_email, EmailNotValidError

class Validator:
    """Input validation utilities"""
    
    @staticmethod
    def validate_email(email: str) -> Tuple[bool, str]:
        """Validate email format"""
        try:
            valid = validate_email(email)
            return True, valid.email
        except EmailNotValidError as e:
            return False, str(e)
    
    @staticmethod
    def validate_registration(email: str, password: str, full_name: str) -> Tuple[bool, str]:
        """Validate registration data"""
        # Validate email
        is_valid, msg = Validator.validate_email(email)
        if not is_valid:
            return False, f"Invalid email: {msg}"
        
        # Validate password
        if len(password) < 8:
            return False, "Password must be at least 8 characters"
        if not any(c.isupper() for c in password):
            return False, "Password must contain uppercase letter"
        if not any(c.isdigit() for c in password):
            return False, "Password must contain digit"
        
        # Validate full name
        if len(full_name.strip()) < 2:
            return False, "Full name must be at least 2 characters"
        
        return True, "Valid"
    
    @staticmethod
    def validate_vehicle_data(
        make: str,
        model: str,
        engine_size: float,
        cylinders: int,
        fuel_consumption_city: float,
        fuel_consumption_highway: float,
        fuel_consumption_combined: float,
        fuel_type: str,
        vehicle_class: str,
        transmission: str
    ) -> Tuple[bool, str]:
        """Validate vehicle input data"""
        
        # Make and model have defaults, so just validate they're not empty
        if not make:
            make = "ACURA"
        if not model:
            model = "ILX"
        
        # Validate engine size
        if engine_size <= 0 or engine_size > 10:
            return False, "Engine size must be between 0.1 and 10 L"
        
        # Validate cylinders
        if cylinders < 1 or cylinders > 16:
            return False, "Cylinders must be between 1 and 16"
        
        # Validate fuel consumption
        if fuel_consumption_city <= 0 or fuel_consumption_city > 100:
            return False, "City fuel consumption must be between 0.1 and 100 L/100km"
        
        if fuel_consumption_highway <= 0 or fuel_consumption_highway > 100:
            return False, "Highway fuel consumption must be between 0.1 and 100 L/100km"
        
        if fuel_consumption_combined <= 0 or fuel_consumption_combined > 100:
            return False, "Combined fuel consumption must be between 0.1 and 100 L/100km"
        
        # Validate string fields
        valid_fuel_types = ["X", "Z", "D", "E", "N"]
        if fuel_type.upper() not in valid_fuel_types:
            return False, f"Fuel type must be one of: {', '.join(valid_fuel_types)}"
        
        valid_classes = [
            'COMPACT',
            'SUBCOMPACT',
            'MID-SIZE',
            'FULL-SIZE',
            'TWO-SEATER',
            'SUV - SMALL',
            'SUV - STANDARD',
            'PICKUP TRUCK - SMALL',
            'PICKUP TRUCK - STANDARD',
            'VAN - PASSENGER',
            'VAN - CARGO',
            'MINIVAN',
            'STATION WAGON - SMALL',
            'STATION WAGON - MID-SIZE',
        ]
        if vehicle_class.upper() not in valid_classes:
            return False, f"Vehicle class must be one of: {', '.join(valid_classes)}"
        
        if len(transmission.strip()) < 2:
            return False, "Transmission must be specified"
        
        return True, "Valid"
