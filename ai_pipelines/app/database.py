import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from pymongo import MongoClient, DESCENDING
from pymongo.database import Database
from app.config import settings

logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self):
        self._client: Optional[MongoClient] = None
        self._db: Optional[Database] = None

    def connect(self):
        if self._client is None:
            logger.info("Connecting to MongoDB Atlas...")
            self._client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=5000)
            self._db = self._client[settings.MONGODB_DB_NAME]
            # Ensure index on telemetry and results
            try:
                self._db.telemetry_records.create_index([("well_id", DESCENDING), ("timestamp", DESCENDING)])
                self._db.ai_results.create_index([("well_id", DESCENDING), ("timestamp", DESCENDING)])
                logger.info("MongoDB connected successfully.")
            except Exception as e:
                logger.warning(f"Failed to create indices or verify connection: {e}")

    def close(self):
        if self._client:
            self._client.close()
            self._client = None
            self._db = None
            logger.info("MongoDB connection closed.")

    @property
    def db(self) -> Database:
        if self._db is None:
            self.connect()
        return self._db

    def get_recent_telemetry(self, well_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Fetch recent raw/validated telemetry records for a well."""
        try:
            records = list(
                self.db.telemetry_records.find({"well_id": well_id})
                .sort("timestamp", DESCENDING)
                .limit(limit)
            )
            # Reverse so it is in chronological order [oldest ... newest]
            return records[::-1]
        except Exception as e:
            logger.error(f"Error fetching telemetry for {well_id}: {e}")
            return []

    def get_all_wells(self) -> List[str]:
        try:
            return self.db.telemetry_records.distinct("well_id") or [settings.DEFAULT_WELL_ID]
        except Exception as e:
            logger.error(f"Error fetching active wells: {e}")
            return [settings.DEFAULT_WELL_ID]

    def save_ai_results(self, well_id: str, analytics: Dict[str, Any], predictions: Dict[str, Any]):
        try:
            doc = {
                "well_id": well_id,
                "timestamp": datetime.now(timezone.utc),
                "analytics": analytics,
                "predictions": predictions,
            }
            self.db.ai_results.insert_one(doc)
            logger.debug(f"Saved AI analytics and predictions for {well_id}")
        except Exception as e:
            logger.error(f"Error saving AI results for {well_id}: {e}")

    def get_latest_results(self, well_id: str) -> Optional[Dict[str, Any]]:
        try:
            res = self.db.ai_results.find_one(
                {"well_id": well_id},
                sort=[("timestamp", DESCENDING)]
            )
            if res and "_id" in res:
                res["_id"] = str(res["_id"])
            return res
        except Exception as e:
            logger.error(f"Error fetching latest AI results for {well_id}: {e}")
            return None

db_manager = DatabaseManager()
