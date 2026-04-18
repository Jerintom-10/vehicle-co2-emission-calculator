from fastapi import HTTPException, status
from app.auth.jwt_handler import TokenManager

class AuthUtils:
    """Authentication utilities"""
    
    @staticmethod
    def get_user_from_token(token: str):
        """Extract user ID from token"""
        payload = TokenManager.verify_token(token)
        
        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user_id
