from passlib.context import CryptContext
from typing import Tuple

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class PasswordManager:
    """Password hashing and verification"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password"""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify password"""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def validate_password(password: str) -> Tuple[bool, str]:
        """
        Validate password strength
        Returns: (is_valid, message)
        """
        if len(password) < 8:
            return False, "Password must be at least 8 characters long"
        if not any(char.isupper() for char in password):
            return False, "Password must contain at least one uppercase letter"
        if not any(char.isdigit() for char in password):
            return False, "Password must contain at least one digit"
        if not any(char in "!@#$%^&*()-_=+[]{}|;:',.<>?/" for char in password):
            return False, "Password must contain at least one special character"
        return True, "Password is strong"
