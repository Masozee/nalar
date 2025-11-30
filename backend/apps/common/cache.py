"""
Redis caching utilities for API endpoints
"""
from functools import wraps
from django.core.cache import cache
from django.conf import settings


def cache_api_response(timeout=300, key_prefix='api'):
    """
    Decorator to cache API responses in Redis

    Usage:
        @cache_api_response(timeout=600, key_prefix='employees')
        def list(self, request):
            ...

    Args:
        timeout: Cache timeout in seconds (default: 300 = 5 minutes)
        key_prefix: Prefix for cache key (default: 'api')
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Skip caching if DEBUG is True and ENABLE_API_CACHE is not set
            if settings.DEBUG and not getattr(settings, 'ENABLE_API_CACHE', False):
                return func(*args, **kwargs)

            # Build cache key from function name and args
            request = args[1] if len(args) > 1 else kwargs.get('request')

            # Include query params and kwargs (like pk) in cache key
            query_string = request.GET.urlencode() if request else ''

            # Include pk or other kwargs for detail views
            pk = kwargs.get('pk', '')
            kwargs_str = f"pk:{pk}" if pk else ''

            cache_key = f"{key_prefix}:{func.__name__}:{kwargs_str}:{query_string}"

            # Try to get from cache
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                # Return Response with cached data
                from rest_framework.response import Response
                return Response(cached_data)

            # Execute function and get response
            response = func(*args, **kwargs)

            # Cache the response data (not the Response object)
            # This avoids pickle serialization issues
            if hasattr(response, 'data'):
                cache.set(cache_key, response.data, timeout=timeout)

            return response
        return wrapper
    return decorator


def invalidate_cache(pattern):
    """
    Invalidate cache keys matching a pattern

    Usage:
        invalidate_cache('employees:*')
    """
    from django_redis import get_redis_connection
    redis_conn = get_redis_connection("default")

    # Get all keys matching pattern
    keys = redis_conn.keys(f"{settings.CACHES['default']['KEY_PREFIX']}:*:{pattern}")

    if keys:
        redis_conn.delete(*keys)
        return len(keys)
    return 0


def get_cache_stats():
    """
    Get Redis cache statistics
    """
    from django_redis import get_redis_connection
    redis_conn = get_redis_connection("default")

    info = redis_conn.info()
    return {
        'redis_version': info['redis_version'],
        'connected_clients': info['connected_clients'],
        'used_memory': info['used_memory_human'],
        'total_keys': redis_conn.dbsize(),
        'hits': info.get('keyspace_hits', 0),
        'misses': info.get('keyspace_misses', 0),
        'hit_rate': f"{(info.get('keyspace_hits', 0) / max(info.get('keyspace_hits', 0) + info.get('keyspace_misses', 0), 1)) * 100:.2f}%"
    }
