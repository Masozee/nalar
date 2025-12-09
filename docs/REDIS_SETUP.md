# Redis Setup for Nalar ERP

## Overview

Redis is now configured and running for:
- ✅ **API Response Caching** - Speed up frequent queries
- ✅ **Session Storage** - Faster session management
- ✅ **Future WebSocket Support** - Ready for Django Channels

---

## 🚀 Redis Container Status

### Check Redis Status
```bash
podman ps --filter name=nalar_redis
```

### View Redis Logs
```bash
podman logs nalar_redis
```

### Connect to Redis CLI
```bash
podman exec -it nalar_redis redis-cli -a nalar_redis_secret
```

### Stop/Start Redis
```bash
# Stop
podman stop nalar_redis

# Start
podman start nalar_redis

# Restart
podman restart nalar_redis
```

---

## 📊 Redis Configuration

### Container Details
- **Image**: `redis:7-alpine`
- **Port**: `6379` (mapped to localhost:6379)
- **Password**: `nalar_redis_secret`
- **Persistence**: AOF (Append Only File) enabled
- **Volume**: `nalar_redis_data`
- **Database**: Using DB 1 for Django cache

### Django Settings
File: `backend/config/settings/dev.py`

```python
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://localhost:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'PASSWORD': 'nalar_redis_secret',
            'CONNECTION_POOL_KWARGS': {'max_connections': 50},
            'SOCKET_CONNECT_TIMEOUT': 5,
            'SOCKET_TIMEOUT': 5,
        },
        'KEY_PREFIX': 'nalar',
        'TIMEOUT': 300,  # 5 minutes default
    }
}

# Sessions stored in Redis
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'
```

---

## 🧪 Testing Redis Connection

### Quick Test
```bash
cd backend
DB_HOST=localhost DB_NAME=nalar DB_USER=nalar DB_PASSWORD=nalar_secret \
DJANGO_SETTINGS_MODULE=config.settings.dev \
uv run python test_redis.py
```

### Expected Output
```
============================================================
Redis Connection Test
============================================================

✓ Cache backend: django_redis.cache.RedisCache
✓ Cache location: redis://localhost:6379/1

--- Testing cache operations ---
Setting cache: test_key = Hello from Redis!
Retrieved value: Hello from Redis!
✅ Cache SET and GET working!

--- Testing cache deletion ---
✅ Cache DELETE working!

--- Redis Info ---
✓ Redis version: 7.4.7
✓ Connected clients: 1
✓ Used memory: 1.14M
✓ Total keys in DB: 0

✅ All Redis tests passed!
```

---

## 💻 Using Redis Cache in Django

### 1. Basic Cache Operations

```python
from django.core.cache import cache

# Set a value (expires in 5 minutes by default)
cache.set('user_123_profile', user_data, timeout=300)

# Get a value
user_data = cache.get('user_123_profile')

# Delete a value
cache.delete('user_123_profile')

# Set multiple values
cache.set_many({
    'key1': 'value1',
    'key2': 'value2',
}, timeout=600)

# Get multiple values
values = cache.get_many(['key1', 'key2'])
```

### 2. Cache API Responses (Decorator)

```python
from apps.common.cache import cache_api_response

class EmployeeViewSet(viewsets.ModelViewSet):
    @cache_api_response(timeout=600, key_prefix='employees')
    def list(self, request):
        """
        This response will be cached for 10 minutes
        Cache key includes query parameters automatically
        """
        return super().list(request)
```

### 3. Invalidate Cache

```python
from apps.common.cache import invalidate_cache

# Invalidate all employee caches
invalidate_cache('employees:*')
```

### 4. Cache Statistics

```python
from apps.common.cache import get_cache_stats

stats = get_cache_stats()
print(stats)
# {
#     'redis_version': '7.4.7',
#     'connected_clients': 2,
#     'used_memory': '2.5M',
#     'total_keys': 125,
#     'hits': 1523,
#     'misses': 234,
#     'hit_rate': '86.68%'
# }
```

---

## 📈 Performance Benefits

### Before Redis
- **Session Storage**: Database query on every request
- **API Responses**: Database query every time
- **Login/Auth**: Multiple DB queries per request

### With Redis
- **Session Storage**: ⚡ In-memory (100x faster)
- **API Responses**: ⚡ Cached (no DB query)
- **Login/Auth**: ⚡ Cached user data

### Estimated Improvements
| Operation | Before | With Redis | Speedup |
|-----------|--------|------------|---------|
| Session Read | 5-10ms | 0.1-0.5ms | **20x faster** |
| Employee List (100 records) | 50-100ms | 1-5ms | **20x faster** |
| User Profile | 10-20ms | 0.5-1ms | **20x faster** |
| Dashboard Stats | 100-200ms | 5-10ms | **20x faster** |

---

## 🎯 Recommended Caching Strategy

### What to Cache (HIGH value)
1. ✅ **User sessions** (already configured)
2. ✅ **Frequently accessed lists** (employees, assets, SKUs)
3. ✅ **Dashboard statistics** (calculated once, cached 5-10 min)
4. ✅ **Reference data** (departments, categories, policies)
5. ✅ **Computed reports** (expensive calculations)

### What NOT to Cache
1. ❌ **User-specific data** (unless key includes user ID)
2. ❌ **Real-time data** (stock levels, approval status)
3. ❌ **Sensitive data** (passwords, tokens)
4. ❌ **Large objects** (>1MB documents)

### Cache Timeouts
```python
# Reference data (rarely changes)
cache.set('departments', data, timeout=3600)  # 1 hour

# List data (moderate changes)
cache.set('employees_list', data, timeout=300)  # 5 minutes

# Stats/computed data (frequent changes)
cache.set('dashboard_stats', data, timeout=60)  # 1 minute

# User sessions (Django default)
SESSION_COOKIE_AGE = 1209600  # 2 weeks
```

---

## 🔧 Monitoring Redis

### Monitor in Real-Time
```bash
# Watch Redis commands
podman exec -it nalar_redis redis-cli -a nalar_redis_secret monitor

# Check memory usage
podman exec -it nalar_redis redis-cli -a nalar_redis_secret info memory

# Check connected clients
podman exec -it nalar_redis redis-cli -a nalar_redis_secret client list
```

### Key Metrics to Watch
```bash
# Inside redis-cli
INFO stats

# Look for:
# - keyspace_hits: Number of successful key lookups
# - keyspace_misses: Number of failed key lookups
# - used_memory: Current memory usage
# - connected_clients: Active connections
```

---

## 🚨 Troubleshooting

### Redis Container Not Starting
```bash
# Check logs
podman logs nalar_redis

# Restart container
podman restart nalar_redis

# Recreate container
podman rm -f nalar_redis
podman run -d --name nalar_redis ...
```

### Authentication Errors
```python
# Verify password in settings
CACHES['default']['OPTIONS']['PASSWORD'] = 'nalar_redis_secret'

# Test connection
podman exec nalar_redis redis-cli -a nalar_redis_secret ping
# Should return: PONG
```

### Cache Not Working
```python
# Enable cache in development
# In settings/dev.py
ENABLE_API_CACHE = True

# Clear all cache
from django.core.cache import cache
cache.clear()
```

### Memory Issues
```bash
# Check Redis memory
podman exec nalar_redis redis-cli -a nalar_redis_secret info memory

# Set max memory limit (in redis.conf)
maxmemory 256mb
maxmemory-policy allkeys-lru  # Evict least recently used
```

---

## 🔜 Next Steps

### Phase 1: Basic Caching (Complete ✅)
- ✅ Redis container running
- ✅ Django configured
- ✅ Session storage migrated
- ✅ Cache utilities created

### Phase 2: API Caching (Recommended)
- [ ] Add caching to employee endpoints
- [ ] Add caching to asset lists
- [ ] Add caching to dashboard stats
- [ ] Monitor cache hit rates

### Phase 3: WebSocket Support (Future)
- [ ] Install Django Channels
- [ ] Configure Redis as channel layer
- [ ] Implement real-time notifications
- [ ] Add approval workflow notifications

---

## 📚 Resources

- [Redis Documentation](https://redis.io/docs/)
- [Django-Redis GitHub](https://github.com/jazzband/django-redis)
- [Django Caching](https://docs.djangoproject.com/en/5.2/topics/cache/)
- [Redis Best Practices](https://redis.io/docs/latest/develop/use/patterns/)

---

## ✅ Quick Reference

```bash
# Start all services
podman start nalar_db nalar_redis

# Stop all services
podman stop nalar_db nalar_redis

# View all containers
podman ps -a

# Redis health check
podman exec nalar_redis redis-cli -a nalar_redis_secret ping

# Django test
cd backend && uv run python test_redis.py

# Clear Django cache
cd backend && uv run python manage.py shell -c "from django.core.cache import cache; cache.clear(); print('Cache cleared!')"
```

---

**Status**: ✅ **Redis is ready for use!**

Next: Add `@cache_api_response` decorators to your ViewSets for instant performance gains.
