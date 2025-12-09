#!/usr/bin/env python
"""
Script to automatically add TenantMixin to all model files.

Usage:
    python scripts/add_tenant_mixin.py
"""

import os
import re
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent
APPS_DIR = BASE_DIR / 'apps'

# Files to skip
SKIP_FILES = [
    'apps/core/models',
    'apps/users/models.py',  # Users don't belong to tenants
    'apps/tenants/models.py',  # Tenant models themselves
]

def should_skip_file(file_path):
    """Check if file should be skipped."""
    file_str = str(file_path)
    return any(skip in file_str for skip in SKIP_FILES)

def add_tenant_mixin_to_file(file_path):
    """Add TenantMixin to a model file."""
    with open(file_path, 'r') as f:
        content = f.read()

    original_content = content
    modified = False

    # Step 1: Add TenantMixin to imports if not present
    if 'from apps.core.models import' in content:
        # Check if TenantMixin is already imported
        if 'TenantMixin' not in content:
            # Add TenantMixin to existing import
            content = re.sub(
                r'from apps\.core\.models import (.*?)$',
                lambda m: f'from apps.core.models import {m.group(1)}, TenantMixin' if 'TenantMixin' not in m.group(1) else m.group(0),
                content,
                flags=re.MULTILINE
            )
            # Remove duplicate commas
            content = re.sub(r',\s*,', ',', content)
            modified = True

    # Step 2: Add TenantMixin to model class definitions
    # Pattern: class ModelName(BaseModel, ...) or class ModelName(BaseModel)
    # Add TenantMixin after BaseModel if not present
    def add_mixin_to_class(match):
        class_def = match.group(0)
        if 'TenantMixin' in class_def:
            return class_def  # Already has TenantMixin
        if 'BaseModel' in class_def:
            # Insert TenantMixin after BaseModel
            return class_def.replace('BaseModel,', 'BaseModel, TenantMixin,').replace('BaseModel)', 'BaseModel, TenantMixin)')
        return class_def

    pattern = r'class\s+\w+\(BaseModel[^)]*\):'
    new_content = re.sub(pattern, add_mixin_to_class, content)

    if new_content != content:
        content = new_content
        modified = True

    # Only write if modified
    if modified and content != original_content:
        with open(file_path, 'w') as f:
            f.write(content)
        return True

    return False

def main():
    """Main function to process all model files."""
    print("=" * 70)
    print("Adding TenantMixin to model files...")
    print("=" * 70)

    model_files = []

    # Find all models.py files
    for root, dirs, files in os.walk(APPS_DIR):
        # Skip migrations and __pycache__
        dirs[:] = [d for d in dirs if d not in ['migrations', '__pycache__', '.venv']]

        for file in files:
            if file == 'models.py':
                file_path = Path(root) / file
                if not should_skip_file(file_path):
                    model_files.append(file_path)

    print(f"\nFound {len(model_files)} model files to process\n")

    updated_files = []
    skipped_files = []

    for file_path in sorted(model_files):
        rel_path = file_path.relative_to(BASE_DIR)

        if add_tenant_mixin_to_file(file_path):
            print(f"✓ Updated: {rel_path}")
            updated_files.append(rel_path)
        else:
            print(f"- Skipped: {rel_path} (already has TenantMixin or no BaseModel)")
            skipped_files.append(rel_path)

    print("\n" + "=" * 70)
    print(f"Summary:")
    print(f"  Updated: {len(updated_files)} files")
    print(f"  Skipped: {len(skipped_files)} files")
    print("=" * 70)

    if updated_files:
        print("\nUpdated files:")
        for f in updated_files:
            print(f"  - {f}")

if __name__ == '__main__':
    main()
