from celery import Celery

from atlasiq.config import get_settings

settings = get_settings()
celery_app = Celery("atlasiq", broker=settings.redis_url.get_secret_value())
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    task_ignore_result=True,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    worker_prefetch_multiplier=1,
    task_soft_time_limit=240,
    task_time_limit=300,
    broker_connection_retry_on_startup=True,
    task_default_queue="atlasiq",
)
# Domain tasks are intentionally registered only as their phases are implemented.
