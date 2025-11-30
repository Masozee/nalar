"""
Document encryption utilities using AES-256-GCM.
"""
import os
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from django.conf import settings


def get_encryption_key():
    """Get or generate encryption key from settings."""
    key = getattr(settings, 'DOCUMENT_ENCRYPTION_KEY', None)
    if key:
        # Key should be base64 encoded 32-byte key
        return base64.b64decode(key)
    # Fallback for development - generate from SECRET_KEY
    # In production, always set DOCUMENT_ENCRYPTION_KEY
    from hashlib import sha256
    return sha256(settings.SECRET_KEY.encode()).digest()


def encrypt_file(file_data: bytes) -> tuple[bytes, bytes]:
    """
    Encrypt file data using AES-256-GCM.

    Returns:
        tuple: (encrypted_data, nonce)
    """
    key = get_encryption_key()
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)  # 96-bit nonce for GCM
    encrypted_data = aesgcm.encrypt(nonce, file_data, None)
    return encrypted_data, nonce


def decrypt_file(encrypted_data: bytes, nonce: bytes) -> bytes:
    """
    Decrypt file data using AES-256-GCM.

    Args:
        encrypted_data: The encrypted file content
        nonce: The nonce used during encryption

    Returns:
        bytes: Decrypted file data
    """
    key = get_encryption_key()
    aesgcm = AESGCM(key)
    return aesgcm.decrypt(nonce, encrypted_data, None)


def encrypt_file_to_base64(file_data: bytes) -> dict:
    """
    Encrypt and return base64-encoded data for storage.

    Returns:
        dict: {'data': base64_encrypted, 'nonce': base64_nonce}
    """
    encrypted_data, nonce = encrypt_file(file_data)
    return {
        'data': base64.b64encode(encrypted_data).decode('utf-8'),
        'nonce': base64.b64encode(nonce).decode('utf-8'),
    }


def decrypt_file_from_base64(encrypted_b64: str, nonce_b64: str) -> bytes:
    """
    Decrypt base64-encoded encrypted data.

    Args:
        encrypted_b64: Base64-encoded encrypted data
        nonce_b64: Base64-encoded nonce

    Returns:
        bytes: Decrypted file data
    """
    encrypted_data = base64.b64decode(encrypted_b64)
    nonce = base64.b64decode(nonce_b64)
    return decrypt_file(encrypted_data, nonce)
