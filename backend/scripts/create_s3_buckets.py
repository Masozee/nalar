#!/usr/bin/env python3
"""
Create initial S3 buckets in RustFS
Run this script after RustFS is up and running
"""
import os
import boto3
from botocore.client import Config
from botocore.exceptions import ClientError

# RustFS connection settings
RUSTFS_ENDPOINT = os.getenv('RUSTFS_ENDPOINT_INTERNAL', 'http://rustfs:9000')
RUSTFS_USER = os.getenv('RUSTFS_ROOT_USER', 'rustfsadmin')
RUSTFS_PASSWORD = os.getenv('RUSTFS_ROOT_PASSWORD', 'rustfsadmin')

# Buckets to create
BUCKETS = [
    'nalar-media',      # User-uploaded media files
    'nalar-uploads',    # Temporary uploads
    'nalar-backups',    # Database and file backups
    'nalar-static',     # Optional: static files
]

def create_s3_client():
    """Create and return S3 client configured for RustFS"""
    return boto3.client(
        's3',
        endpoint_url=RUSTFS_ENDPOINT,
        aws_access_key_id=RUSTFS_USER,
        aws_secret_access_key=RUSTFS_PASSWORD,
        config=Config(signature_version='s3v4'),
        region_name='us-east-1',
        verify=False  # Disable SSL verification for local development
    )

def bucket_exists(s3_client, bucket_name):
    """Check if bucket exists"""
    try:
        s3_client.head_bucket(Bucket=bucket_name)
        return True
    except ClientError:
        return False

def create_bucket(s3_client, bucket_name):
    """Create a bucket if it doesn't exist"""
    try:
        if bucket_exists(s3_client, bucket_name):
            print(f"✓ Bucket '{bucket_name}' already exists")
            return True

        s3_client.create_bucket(Bucket=bucket_name)
        print(f"✓ Created bucket '{bucket_name}'")
        return True
    except Exception as e:
        print(f"✗ Failed to create bucket '{bucket_name}': {e}")
        return False

def set_public_policy(s3_client, bucket_name):
    """Set public read policy for media bucket"""
    import json

    policy = {
        "Version": "2012-10-17",
        "Statement": [{
            "Sid": "PublicRead",
            "Effect": "Allow",
            "Principal": "*",
            "Action": ["s3:GetObject"],
            "Resource": [f"arn:aws:s3:::{bucket_name}/*"]
        }]
    }

    try:
        s3_client.put_bucket_policy(
            Bucket=bucket_name,
            Policy=json.dumps(policy)
        )
        print(f"  → Set public read policy on '{bucket_name}'")
        return True
    except Exception as e:
        print(f"  → Failed to set policy on '{bucket_name}': {e}")
        return False

def main():
    print("=" * 60)
    print("RustFS S3 Bucket Setup")
    print("=" * 60)
    print(f"Endpoint: {RUSTFS_ENDPOINT}")
    print(f"User: {RUSTFS_USER}")
    print()

    # Create S3 client
    try:
        s3_client = create_s3_client()
        print("✓ Connected to RustFS")
        print()
    except Exception as e:
        print(f"✗ Failed to connect to RustFS: {e}")
        print("\nMake sure RustFS is running:")
        print("  podman-compose --env-file .env.production up -d rustfs")
        return 1

    # Create buckets
    print("Creating buckets...")
    success_count = 0
    for bucket in BUCKETS:
        if create_bucket(s3_client, bucket):
            success_count += 1

            # Set public policy for media bucket
            if bucket == 'nalar-media':
                set_public_policy(s3_client, bucket)

    print()
    print("=" * 60)
    print(f"Summary: {success_count}/{len(BUCKETS)} buckets ready")
    print("=" * 60)

    # List all buckets
    try:
        response = s3_client.list_buckets()
        print("\nAll buckets:")
        for bucket in response['Buckets']:
            print(f"  • {bucket['Name']}")
    except Exception as e:
        print(f"\nFailed to list buckets: {e}")

    return 0 if success_count == len(BUCKETS) else 1

if __name__ == '__main__':
    exit(main())
