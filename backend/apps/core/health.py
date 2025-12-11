"""
Health check endpoints for monitoring service status
"""
import time
from django.http import JsonResponse
from django.core.cache import cache
from django.db import connection
from django.utils import timezone


def health_check(request):
    """
    Comprehensive health check endpoint
    Returns status for Redis, Database with response times
    """
    timestamp = timezone.now().isoformat()

    # Check Redis
    redis_status = "ok"
    redis_state = "connected"
    redis_start = time.time()
    try:
        cache.set('health_check', 'test', 10)
        result = cache.get('health_check')
        if result != 'test':
            redis_status = "error"
            redis_state = "disconnected"
    except Exception as e:
        redis_status = "error"
        redis_state = f"error: {str(e)}"
    redis_response_time = round((time.time() - redis_start) * 1000, 2)  # Convert to ms

    # Check Database
    db_status = "ok"
    db_state = "connected"
    db_start = time.time()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except Exception as e:
        db_status = "error"
        db_state = f"error: {str(e)}"
    db_response_time = round((time.time() - db_start) * 1000, 2)  # Convert to ms

    # Overall status
    overall_status = "ok" if (redis_status == "ok" and db_status == "ok") else "degraded"

    return JsonResponse({
        "status": overall_status,
        "timestamp": timestamp,
        "services": {
            "redis": {
                "status": redis_status,
                "state": redis_state,
                "responseTime": redis_response_time
            },
            "database": {
                "status": db_status,
                "state": db_state,
                "responseTime": db_response_time
            }
        },
        "responseTimes": {
            "redis": redis_response_time,
            "database": db_response_time,
            "total": round(redis_response_time + db_response_time, 2)
        }
    })
