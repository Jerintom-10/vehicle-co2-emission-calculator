from typing import Optional, Dict
from bson import ObjectId
from app.database import get_users_collection
from app.auth.password import PasswordManager
from app.auth.jwt_handler import TokenManager

class UserService:
    """User management service"""
    
    @staticmethod
    async def create_user(email: str, password: str, full_name: str) -> Optional[Dict]:
        """Create new user"""
        users_col = await get_users_collection()
        
        # Check if user exists
        existing = await users_col.find_one({"email": email})
        if existing:
            return None
        
        # Hash password
        password_hash = PasswordManager.hash_password(password)
        
        # Create user
        user_data = {
            "email": email,
            "password_hash": password_hash,
            "full_name": full_name,
            "is_admin": False,
            "created_at": ObjectId().generation_time,
            "updated_at": ObjectId().generation_time
        }
        
        result = await users_col.insert_one(user_data)
        user_data["_id"] = str(result.inserted_id)
        
        return user_data
    
    @staticmethod
    async def get_user_by_email(email: str) -> Optional[Dict]:
        """Get user by email"""
        users_col = await get_users_collection()
        user = await users_col.find_one({"email": email})
        
        if user:
            user["_id"] = str(user["_id"])
        
        return user
    
    @staticmethod
    async def get_user_by_id(user_id: str) -> Optional[Dict]:
        """Get user by ID"""
        users_col = await get_users_collection()
        
        try:
            user = await users_col.find_one({"_id": ObjectId(user_id)})
            if user:
                user["_id"] = str(user["_id"])
            return user
        except:
            return None
    
    @staticmethod
    async def verify_user(email: str, password: str) -> Optional[Dict]:
        """Verify user credentials"""
        user = await UserService.get_user_by_email(email)
        
        if not user:
            return None
        
        if PasswordManager.verify_password(password, user["password_hash"]):
            return user
        
        return None
    
    @staticmethod
    async def create_access_token(user: Dict) -> str:
        """Create access token for user"""
        token = TokenManager.create_access_token(data={"sub": user["_id"]})
        return token
    
    @staticmethod
    async def update_user(user_id: str, update_data: Dict) -> Optional[Dict]:
        """Update user data"""
        users_col = await get_users_collection()
        
        # Remove sensitive fields
        update_data.pop("_id", None)
        update_data.pop("password_hash", None)
        update_data.pop("is_admin", None)
        
        result = await users_col.find_one_and_update(
            {"_id": ObjectId(user_id)},
            {"$set": update_data},
            return_document=True
        )
        
        if result:
            result["_id"] = str(result["_id"])
        
        return result
