import logging
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from app.database import db_manager
from app.analytics.engine import AnalyticsEngine
from app.predictions.engine import PredictionEngine
from app.config import settings

logger = logging.getLogger(__name__)

class PipelineRunner:
    @staticmethod
    def execute(well_id: Optional[str] = None) -> Dict[str, Any]:
        target_well = well_id or settings.DEFAULT_WELL_ID
        records = db_manager.get_recent_telemetry(target_well, limit=50)

        if not records:
            logger.warning(f"No records found in DB for {target_well}. Using baseline telemetry.")
            records = [{
                "timestamp": datetime.now(timezone.utc),
                "well_id": target_well,
                "vfd_frequency_hz": 40.0,
                "stroke_length_m": 2.5,
                "spm": 5.5,
                "rod_position_m": 1.25,
                "rod_load_kn": 145.2,
                "motor_current_a": 72.4,
                "tubing_pressure_bar": 18.5,
                "fluid_level_m": 850.0,
                "production_bopd": 31.4,
                "temperature_c": 50.0,
                "viscosity_cp": 12000.0,
            }]

        # 1. Run all 15 Analytics
        analytics = AnalyticsEngine.run(records)

        # 2. Run all 13 Predictions
        predictions = PredictionEngine.run(records, analytics)

        # 3. Persist to MongoDB
        db_manager.save_ai_results(target_well, analytics, predictions)

        return {
            "well_id": target_well,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "records_analyzed": len(records),
            "analytics": analytics,
            "predictions": predictions,
        }

pipeline_runner = PipelineRunner()
