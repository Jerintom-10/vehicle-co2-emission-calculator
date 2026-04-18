from fastapi import APIRouter, HTTPException, status, Header
from fastapi.responses import StreamingResponse
from app.services.prediction_service import PredictionService
from app.services.pdf_service import PDFReportService
from app.services.user_service import UserService
from app.utils.auth_utils import AuthUtils
import io

router = APIRouter(prefix="/api/reports", tags=["reports"])

@router.get("/prediction/{prediction_id}")
async def get_prediction_report(
    prediction_id: str,
    authorization: str = Header(None)
):
    """Download prediction report as PDF"""
    
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
    
    # Get user info
    user = await UserService.get_user_by_id(user_id)
    user_name = user.get("full_name", "User") if user else "User"
    
    # Generate PDF
    pdf_content = PDFReportService.generate_prediction_report(prediction, user_name)
    
    return StreamingResponse(
        io.BytesIO(pdf_content),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=prediction_{prediction_id}.pdf"}
    )

@router.get("/history")
async def get_history_report(authorization: str = Header(None)):
    """Download history report as PDF"""
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header"
        )
    token = authorization.replace("Bearer ", "")
    user_id = AuthUtils.get_user_from_token(token)
    
    # Get predictions
    predictions = await PredictionService.get_user_predictions(user_id, limit=None)
    
    # Get statistics
    stats = await PredictionService.get_user_statistics(user_id)
    
    # Get user info
    user = await UserService.get_user_by_id(user_id)
    user_name = user.get("full_name", "User") if user else "User"
    
    # Generate PDF
    pdf_content = PDFReportService.generate_history_report(predictions, user_name, stats)
    
    return StreamingResponse(
        io.BytesIO(pdf_content),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=ecovehicle_history_report.pdf"}
    )
