from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from app.pipeline import pipeline_runner
from app.database import db_manager

router = APIRouter(prefix="/api/v1", tags=["AI Pipeline"])

@router.post("/pipeline/run")
def run_pipeline(well_id: Optional[str] = Query(None)):
    """Triggers on-demand evaluation of all 15 analytics and 13 predictions."""
    try:
        results = pipeline_runner.execute(well_id)
        return {"success": True, "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/pipeline/latest")
def get_latest(well_id: Optional[str] = Query("BW-001")):
    """Returns the latest stored AI run results for a well."""
    res = db_manager.get_latest_results(well_id)
    if not res:
        # Fallback to computing on the fly
        res = pipeline_runner.execute(well_id)
    return {"success": True, "data": res}

@router.get("/analytics/latest")
def get_latest_analytics(well_id: Optional[str] = Query("BW-001")):
    """Returns all 15 real-time Analytics metrics."""
    res = db_manager.get_latest_results(well_id)
    if not res or "analytics" not in res:
        res = pipeline_runner.execute(well_id)
    return {"success": True, "well_id": well_id, "analytics": res.get("analytics", {})}

@router.get("/predictions/latest")
def get_latest_predictions(well_id: Optional[str] = Query("BW-001")):
    """Returns all 13 Prediction forecasts and mechanical risk assessments."""
    res = db_manager.get_latest_results(well_id)
    if not res or "predictions" not in res:
        res = pipeline_runner.execute(well_id)
    return {"success": True, "well_id": well_id, "predictions": res.get("predictions", {})}

@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "ai_pipelines",
        "database": "connected" if db_manager.db is not None else "disconnected"
    }
