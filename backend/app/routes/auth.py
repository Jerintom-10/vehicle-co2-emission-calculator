from fastapi import APIRouter, HTTPException, status, Body
from datetime import timedelta
from pydantic import BaseModel
from app.services.user_service import UserService
from app.utils.validators import Validator
from app.auth.password import PasswordManager

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Request models
class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
async def register(request: RegisterRequest):
    """Register new user"""
    
    # Validate input
    is_valid, msg = Validator.validate_registration(request.email, request.password, request.full_name)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=msg
        )
    
    # Validate password strength
    is_strong, strength_msg = PasswordManager.validate_password(request.password)
    if not is_strong:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=strength_msg
        )
    
    # Create user
    user = await UserService.create_user(request.email, request.password, request.full_name)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Create token
    token = await UserService.create_access_token(user)
    
    return {
        "status": "success",
        "message": "User registered successfully",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["_id"],
            "email": user["email"],
            "full_name": user["full_name"]
        }
    }

@router.post("/login")
async def login(request: LoginRequest):
    """Login user"""
    
    # Verify user
    user = await UserService.verify_user(request.email, request.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create token
    token = await UserService.create_access_token(user)
    
    return {
        "status": "success",
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["_id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "is_admin": user.get("is_admin", False)
        }
    }

@router.get("/me")
async def get_current_user(token: str):
    """Get current user info"""
    from app.utils.auth_utils import AuthUtils
    
    user_id = AuthUtils.get_user_from_token(token)
    user = await UserService.get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "status": "success",
        "user": {
            "id": user["_id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "is_admin": user.get("is_admin", False),
            "created_at": user.get("created_at")
        }
    }

@router.put("/update-profile")
async def update_profile(
    token: str,
    full_name: str = None,
    email: str = None
):
    """Update user profile"""
    from app.utils.auth_utils import AuthUtils
    
    user_id = AuthUtils.get_user_from_token(token)
    
    update_data = {}
    if full_name:
        if len(full_name.strip()) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Full name must be at least 2 characters"
            )
        update_data["full_name"] = full_name
    
    if email:
        is_valid, msg = Validator.validate_email(email)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=msg
            )
        update_data["email"] = email
    
    user = await UserService.update_user(user_id, update_data)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "status": "success",
        "message": "Profile updated successfully",
        "user": {
            "id": user["_id"],
            "email": user["email"],
            "full_name": user["full_name"]
        }
    }
