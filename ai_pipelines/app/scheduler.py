import asyncio
import logging
from app.config import settings
from app.database import db_manager
from app.pipeline import pipeline_runner

logger = logging.getLogger(__name__)

class PipelineScheduler:
    def __init__(self):
        self._running = False
        self._task: asyncio.Task | None = None

    def start(self):
        if not self._running:
            self._running = True
            self._task = asyncio.create_task(self._run_loop())
            logger.info(f"AI Pipeline Scheduler started (interval: {settings.PIPELINE_INTERVAL_SECONDS}s).")

    def stop(self):
        if self._running:
            self._running = False
            if self._task:
                self._task.cancel()
            logger.info("AI Pipeline Scheduler stopped.")

    async def _run_loop(self):
        # Allow service bootstrap
        await asyncio.sleep(2)
        while self._running:
            try:
                wells = db_manager.get_all_wells()
                for well in wells:
                    logger.debug(f"Running periodic AI evaluation for well: {well}")
                    pipeline_runner.execute(well)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error during scheduled pipeline run: {e}")

            await asyncio.sleep(settings.PIPELINE_INTERVAL_SECONDS)

scheduler = PipelineScheduler()
