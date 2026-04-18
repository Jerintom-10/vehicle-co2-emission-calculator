import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """Application configuration settings"""
    
    # API Settings
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", 8000))
    ENVIRONMENT: str = os.getenv("FASTAPI_ENV", "development")
    
    # Database
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "ecovehicle_db")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))
    JWT_SECRET: str = os.getenv("JWT_SECRET", "your-jwt-secret-key")
    
    # CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    # Model paths
    MODEL_PATH: str = os.path.join(os.path.dirname(__file__), "..", "ml_model", "best_model.pkl")
    DATA_PATH: str = os.path.join(os.path.dirname(__file__), "..", "data")
    
    class Config:
        env_file = ".env"

settings = Settings()
