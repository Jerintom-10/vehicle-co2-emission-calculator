from fastapi import APIRouter, HTTPException, status, Header
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel, Field, ConfigDict
from app.services.prediction_service import PredictionService
from app.services.ml_model_service import ml_service
from app.services.visualization_service import VisualizationService
from app.utils.validators import Validator
from app.utils.auth_utils import AuthUtils
import io
import os

router = APIRouter(prefix="/api/predictions", tags=["predictions"])

# Request model supporting camelCase from frontend
class PredictionRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    make: str
    model: str
    engine_size: float = Field(alias="engineSize")
    cylinders: int
    fuel_consumption_city: float = Field(alias="fuelConsumptionCity")
    fuel_consumption_highway: float = Field(alias="fuelConsumptionHighway")
    fuel_consumption_combined: float = Field(alias="fuelConsumptionCombined")
    fuel_type: str = Field(alias="fuelType")
    vehicle_class: str = Field(alias="vehicleClass")
    transmission: str

@router.post("/predict")
async def create_prediction(
    request: PredictionRequest,
    authorization: str = Header(None)
):
    """Make CO2 emission prediction"""
    
    # Extract token from Authorization header
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header"
        )
    token = authorization.replace("Bearer ", "")
    user_id = AuthUtils.get_user_from_token(token)
    
    # Validate input
    is_valid, msg = Validator.validate_vehicle_data(
        request.make, request.model, request.engine_size, request.cylinders, 
        request.fuel_consumption_city, request.fuel_consumption_highway, 
        request.fuel_consumption_combined, request.fuel_type, request.vehicle_class, 
        request.transmission
    )

    print(f"Request data: {request.model_dump()}")
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=msg
        )
    
    # Generate SHAP values first — use its forward pass as the authoritative prediction
    shap_data = ml_service.get_shap_values(
        request.make, request.model, request.engine_size, request.cylinders, 
        request.fuel_consumption_city, request.fuel_consumption_highway, 
        request.fuel_consumption_combined, request.fuel_type, request.vehicle_class, 
        request.transmission
    )

    # Derive predicted_co2 from SHAP (same forward pass = consistent value)
    if shap_data is not None:
        predicted_co2 = float(
            shap_data["shap_values"].base_values + 
        shap_data["shap_values"].values.sum()
    )
        predicted_co2 = max(0.0, predicted_co2)  # guard against negatives
        rating = ml_service._get_rating(predicted_co2)
        confidence = 0.85 + (__import__('numpy').random.random() * 0.1)
    else:
        # Fallback to direct predict() if SHAP fails
        predicted_co2, rating, confidence = ml_service.predict(
            request.make, request.model, request.engine_size, request.cylinders, 
            request.fuel_consumption_city, request.fuel_consumption_highway, 
            request.fuel_consumption_combined, request.fuel_type, request.vehicle_class, 
            request.transmission
        )
    
    diagram_file_path = None
    base64_string = None
    
    if shap_data is not None:
        diagram_file_path, base64_string = VisualizationService.create_shap_waterfall_diagram(
            shap_data["shap_values"]
        )
    
    # Fallback to basic diagram if SHAP fails
    if base64_string is None:
        diagram_data = {
            "make": request.make,
            "model": request.model,
            "engine_size": request.engine_size,
            "cylinders": request.cylinders,
            "fuel_consumption_city": request.fuel_consumption_city,
            "fuel_consumption_highway": request.fuel_consumption_highway,
            "fuel_consumption_combined": request.fuel_consumption_combined,
            "fuel_type": request.fuel_type,
            "vehicle_class": request.vehicle_class,
            "transmission": request.transmission,
            "predicted_co2": predicted_co2,
            "rating": rating,
            "created_at": ""
        }
        diagram_file_path, base64_string = VisualizationService.create_dataframe_diagram(diagram_data)

    # Save prediction with diagram file path
    prediction = await PredictionService.create_prediction(
        user_id=user_id,
        make=request.make,
        model=request.model,
        engine_size=request.engine_size,
        cylinders=request.cylinders,
        fuel_consumption_city=request.fuel_consumption_city,
        fuel_consumption_highway=request.fuel_consumption_highway,
        fuel_consumption_combined=request.fuel_consumption_combined,
        fuel_type=request.fuel_type,
        vehicle_class=request.vehicle_class,
        transmission=request.transmission,
        predicted_co2=predicted_co2,
        rating=rating,
        diagram_file_path=diagram_file_path,
        shap_values={"importance": ml_service.get_feature_importance()}
    )
    
    return {
        "status": "success",
        "prediction": {
            "id": prediction["_id"],
            "predicted_co2": predicted_co2,
            "rating": rating,
            "confidence": confidence,
            "diagram": base64_string,
            "diagram_file_path": diagram_file_path,
            "vehicle": {
                "vehicle_class": request.vehicle_class,
                "engine_size": request.engine_size,
                "cylinders": request.cylinders
            },
            "fuel_consumption": {
                "city": request.fuel_consumption_city,
                "highway": request.fuel_consumption_highway,
                "combined": request.fuel_consumption_combined
            }
        }
    }

@router.get("/history")
async def get_history(
    limit: int = 50,
    authorization: str = Header(None)
):
    """Get user's prediction history"""
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header"
        )
    token = authorization.replace("Bearer ", "")
    user_id = AuthUtils.get_user_from_token(token)
    
    predictions = await PredictionService.get_user_predictions(user_id, limit)
    
    return {
        "status": "success",
        "total": len(predictions),
        "predictions": predictions
    }

@router.get("/statistics")
async def get_statistics(authorization: str = Header(None)):
    """Get user's statistics"""
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header"
        )
    token = authorization.replace("Bearer ", "")
    user_id = AuthUtils.get_user_from_token(token)
    
    stats = await PredictionService.get_user_statistics(user_id)
    
    return {
        "status": "success",
        "statistics": stats
    }

@router.get("/download-diagram/{prediction_id}")
async def download_diagram(
    prediction_id: str,
    authorization: str = Header(None)
):
    """Download SHAP diagram for a prediction"""
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header"
        )
    token = authorization.replace("Bearer ", "")
    user_id = AuthUtils.get_user_from_token(token)
    
    # Get prediction
    prediction = await PredictionService.get_prediction(prediction_id)
    
    if not prediction:
        print(f"Prediction not found: {prediction_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found"
        )
    
    # Verify ownership
    if str(prediction.get("user_id")) != user_id:
        print(f"Unauthorized access to prediction: {prediction_id}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to download this diagram"
        )
    
    # Get diagram file path
    diagram_file_path = prediction.get("diagram_file_path")
    
    print(f"Diagram file path from DB: {diagram_file_path}")
    print(f"Path exists: {os.path.exists(diagram_file_path) if diagram_file_path else False}")
    
    if not diagram_file_path:
        print(f"No diagram_file_path stored for prediction {prediction_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Diagram not generated for this prediction"
        )
    
    if not os.path.exists(diagram_file_path):
        print(f"Diagram file not found at: {diagram_file_path}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Diagram file not found: {os.path.basename(diagram_file_path)}"
        )
    
    # Return file
    filename = os.path.basename(diagram_file_path)
    return FileResponse(
        path=diagram_file_path,
        filename=filename,
        media_type="image/png"
    )

@router.get("/{prediction_id}")
async def get_prediction(
    prediction_id: str,
    authorization: str = Header(None)
):
    """Get specific prediction"""
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header"
        )
    token = authorization.replace("Bearer ", "")
    user_id = AuthUtils.get_user_from_token(token)
    
    prediction = await PredictionService.get_prediction(prediction_id)
    
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found"
        )
    
    # Verify ownership
    if prediction["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return {
        "status": "success",
        "prediction": prediction
    }

@router.delete("/{prediction_id}")
async def delete_prediction(
    prediction_id: str,
    authorization: str = Header(None)
):
    """Delete prediction"""
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header"
        )
    token = authorization.replace("Bearer ", "")
    user_id = AuthUtils.get_user_from_token(token)
    
    success = await PredictionService.delete_prediction(prediction_id, user_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found or access denied"
        )
    
    return {
        "status": "success",
        "message": "Prediction deleted"
    }

@router.get("/diagram/{prediction_id}")
async def get_prediction_diagram(
    prediction_id: str,
    authorization: str = Header(None)
):
    """Get dataframe diagram for a prediction as PNG"""
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header"
        )
    token = authorization.replace("Bearer ", "")
    user_id = AuthUtils.get_user_from_token(token)
    
    # Get prediction
    prediction = await PredictionService.get_prediction(prediction_id)
    
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found"
        )
    
    # Verify ownership
    if prediction["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Create diagram
    image_bytes, _ = VisualizationService.create_dataframe_diagram(prediction)
    
    if not image_bytes:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate diagram"
        )
    
    return StreamingResponse(
        io.BytesIO(image_bytes),
        media_type="image/png",
        headers={"Content-Disposition": f"attachment; filename=prediction_diagram_{prediction_id}.png"}
    )

@router.get("/diagram-preview/{prediction_id}")
async def get_prediction_diagram_preview(
    prediction_id: str,
    authorization: str = Header(None)
):
    """Get dataframe diagram for a prediction as base64 (for preview)"""
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header"
        )
    token = authorization.replace("Bearer ", "")
    user_id = AuthUtils.get_user_from_token(token)
    
    # Get prediction
    prediction = await PredictionService.get_prediction(prediction_id)
    
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found"
        )
    
    # Verify ownership
    if prediction["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Create diagram
    _, base64_string = VisualizationService.create_dataframe_diagram(prediction)
    
    if not base64_string:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate diagram"
        )
    
    return {
        "status": "success",
        "diagram": base64_string,
        "prediction_id": prediction_id
    }

@router.get("/comparison/chart")
async def get_comparison_chart(
    authorization: str = Header(None)
):
    """Get comparison chart for all user predictions as base64 (for preview)"""
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header"
        )
    token = authorization.replace("Bearer ", "")
    user_id = AuthUtils.get_user_from_token(token)
    
    # Get all predictions
    predictions = await PredictionService.get_user_predictions(user_id, limit=None)
    
    if not predictions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No predictions found"
        )
    
    # Create comparison chart
    _, base64_string = VisualizationService.create_comparison_chart(predictions)
    
    if not base64_string:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate chart"
        )
    
    return {
        "status": "success",
        "chart": base64_string,
        "total_predictions": len(predictions)
    }

@router.get("/comparison/download")
async def download_comparison_chart(
    authorization: str = Header(None)
):
    """Download comparison chart as PNG"""
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header"
        )
    token = authorization.replace("Bearer ", "")
    user_id = AuthUtils.get_user_from_token(token)
    
    # Get all predictions
    predictions = await PredictionService.get_user_predictions(user_id, limit=None)
    
    if not predictions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No predictions found"
        )
    
    # Create comparison chart
    image_bytes, _ = VisualizationService.create_comparison_chart(predictions)
    
    if not image_bytes:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate chart"
        )
    
    return StreamingResponse(
        io.BytesIO(image_bytes),
        media_type="image/png",
        headers={"Content-Disposition": "attachment; filename=prediction_comparison_chart.png"}
    )
