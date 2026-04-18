from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from datetime import datetime
import os
from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection
from app.routes import auth, predictions, reports

# Initialize FastAPI app
app = FastAPI(
    title="🚗 EcoVehicle API",
    description="Vehicle CO2 Emission Prediction System",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(auth.router)
app.include_router(predictions.router)
app.include_router(reports.router)

# Serve static files from uploads directory
uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)
    print(f"Created uploads directory: {uploads_dir}")

app.mount("/api/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Root endpoint
@app.get("/")
async def root():
    """Welcome endpoint"""
    return {
        "status": "success",
        "message": "🚗 Welcome to EcoVehicle API",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "endpoints": {
            "docs": "/docs",
            "auth": "/api/auth",
            "predictions": "/api/predictions",
            "reports": "/api/reports"
        }
    }

# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

# Startup event
@app.on_event("startup")
async def startup():
    """Initialize on startup"""
    print("🚀 Starting EcoVehicle API...")
    await connect_to_mongo()
    print("✅ API started successfully")

# Shutdown event
@app.on_event("shutdown")
async def shutdown():
    """Cleanup on shutdown"""
    print("🛑 Shutting down EcoVehicle API...")
    await close_mongo_connection()
    print("✅ API shutdown complete")

# Error handlers
@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions"""
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "Internal server error",
            "detail": str(exc)
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.ENVIRONMENT == "development"
    )

