#!/usr/bin/env python
"""
Test Redis connection from Django
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')
django.setup()

from django.core.cache import cache
from django.conf import settings

print("=" * 60)
print("Redis Connection Test")
print("=" * 60)

# Test 1: Check cache backend
print(f"\n✓ Cache backend: {settings.CACHES['default']['BACKEND']}")
print(f"✓ Cache location: {settings.CACHES['default']['LOCATION']}")

# Test 2: Set and get a value
print("\n--- Testing cache operations ---")
test_key = 'test_key'
test_value = 'Hello from Redis!'

print(f"Setting cache: {test_key} = {test_value}")
cache.set(test_key, test_value, timeout=60)

retrieved_value = cache.get(test_key)
print(f"Retrieved value: {retrieved_value}")

if retrieved_value == test_value:
    print("✅ Cache SET and GET working!")
else:
    print("❌ Cache retrieval failed!")

# Test 3: Delete key
print("\n--- Testing cache deletion ---")
cache.delete(test_key)
deleted_check = cache.get(test_key)
if deleted_check is None:
    print("✅ Cache DELETE working!")
else:
    print("❌ Cache deletion failed!")

# Test 4: Test cache stats
print("\n--- Redis Info ---")
try:
    from django_redis import get_redis_connection
    redis_conn = get_redis_connection("default")
    info = redis_conn.info()
    print(f"✓ Redis version: {info['redis_version']}")
    print(f"✓ Connected clients: {info['connected_clients']}")
    print(f"✓ Used memory: {info['used_memory_human']}")
    print(f"✓ Total keys in DB: {redis_conn.dbsize()}")
    print("\n✅ All Redis tests passed!")
except Exception as e:
    print(f"❌ Redis connection error: {e}")

print("\n" + "=" * 60)
