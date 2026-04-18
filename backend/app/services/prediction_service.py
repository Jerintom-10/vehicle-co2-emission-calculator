from typing import Optional, List, Dict
from datetime import datetime
from bson import ObjectId
from app.database import get_predictions_collection
from app.models.schemas import Prediction as PredictionModel

class PredictionService:
    """Prediction management service"""
    
    @staticmethod
    async def create_prediction(
        user_id: str,
        make: str,
        model: str,
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
        diagram_file_path: Optional[str] = None,
        shap_values: Optional[dict] = None
    ) -> Dict:
        """Create new prediction"""
        predictions_col = await get_predictions_collection()
        
        prediction_data = {
            "user_id": ObjectId(user_id) if not isinstance(user_id, ObjectId) else user_id,
            "make": make,
            "model": model,
            "engine_size": engine_size,
            "cylinders": cylinders,
            "fuel_consumption_city": fuel_consumption_city,
            "fuel_consumption_highway": fuel_consumption_highway,
            "fuel_consumption_combined": fuel_consumption_combined,
            "fuel_type": fuel_type,
            "vehicle_class": vehicle_class,
            "transmission": transmission,
            "predicted_co2": predicted_co2,
            "rating": rating,
            "diagram_file_path": diagram_file_path,
            "shap_values": shap_values or {},
            "created_at": datetime.utcnow()
        }
        
        result = await predictions_col.insert_one(prediction_data)
        prediction_data["_id"] = str(result.inserted_id)
        return prediction_data
    
    @staticmethod
    async def get_user_predictions(user_id: str, limit: int = 50) -> List[Dict]:
        """Get all predictions for a user"""
        predictions_col = await get_predictions_collection()
        user_oid = ObjectId(user_id) if not isinstance(user_id, ObjectId) else user_id
        
        cursor = predictions_col.find({"user_id": user_oid}).sort("created_at", -1).limit(limit)
        predictions = await cursor.to_list(length=limit)
        
        for pred in predictions:
            pred["_id"] = str(pred["_id"])
            pred["user_id"] = str(pred["user_id"])
        
        return predictions
    
    @staticmethod
    async def get_prediction(prediction_id: str) -> Optional[Dict]:
        """Get single prediction"""
        predictions_col = await get_predictions_collection()
        prediction = await predictions_col.find_one({"_id": ObjectId(prediction_id)})
        
        if prediction:
            prediction["_id"] = str(prediction["_id"])
            prediction["user_id"] = str(prediction["user_id"])
        
        return prediction
    
    @staticmethod
    async def get_user_statistics(user_id: str) -> Dict:
        """Get prediction statistics for user"""
        predictions_col = await get_predictions_collection()
        user_oid = ObjectId(user_id) if not isinstance(user_id, ObjectId) else user_id
        
        predictions = await predictions_col.find({"user_id": user_oid}).to_list(length=None)
        
        if not predictions:
            return {
                "total_predictions": 0,
                "average_co2": 0,
                "highest_co2": 0,
                "lowest_co2": 0,
                "rating_distribution": {}
            }
        
        co2_values = [p["predicted_co2"] for p in predictions]
        ratings = [p["rating"] for p in predictions]
        
        rating_dist = {}
        for rating in ratings:
            rating_dist[rating] = rating_dist.get(rating, 0) + 1
        
        return {
            "total_predictions": len(predictions),
            "average_co2": sum(co2_values) / len(co2_values),
            "highest_co2": max(co2_values),
            "lowest_co2": min(co2_values),
            "rating_distribution": rating_dist
        }
    
    @staticmethod
    async def delete_prediction(prediction_id: str, user_id: str) -> bool:
        """Delete prediction (owner only)"""
        predictions_col = await get_predictions_collection()
        result = await predictions_col.delete_one({
            "_id": ObjectId(prediction_id),
            "user_id": ObjectId(user_id)
        })
        return result.deleted_count > 0
