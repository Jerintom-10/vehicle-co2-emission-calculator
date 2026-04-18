from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase, AsyncIOMotorCollection
from app.config import settings
from typing import Optional

class Database:
    """MongoDB database connection manager"""
    
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None

db = Database()

async def connect_to_mongo():
    """Connect to MongoDB"""
    db.client = AsyncIOMotorClient(settings.MONGODB_URL)
    db.db = db.client[settings.DATABASE_NAME]
    
    # Create indexes
    users_col = db.db["users"]
    await users_col.create_index("email", unique=True)
    
    predictions_col = db.db["predictions"]
    await predictions_col.create_index("user_id")
    await predictions_col.create_index("created_at")
    
    print(f"Connected to MongoDB: {settings.DATABASE_NAME}")

async def close_mongo_connection():
    """Close MongoDB connection"""
    if db.client is not None:
        db.client.close()
        print("Closed MongoDB connection")

def get_database() -> AsyncIOMotorDatabase:
    """Get database instance"""
    return db.db

async def get_users_collection() -> AsyncIOMotorCollection:
    """Get users collection"""
    return db.db["users"]

async def get_predictions_collection() -> AsyncIOMotorCollection:
    """Get predictions collection"""
    return db.db["predictions"]
