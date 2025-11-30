#!/usr/bin/env python3
"""
Automated Icon Migration Script
Migrates Lucide React imports to universal Icon component
"""

import re
import sys
from pathlib import Path

# Icon size mapping based on className patterns
SIZE_MAP = {
    'h-3 w-3': 12,
    'h-4 w-4': 16,
    'h-5 w-5': 20,
    'h-6 w-6': 24,
    'h-8 w-8': 32,
    'h-12 w-12': 48,
    'size-3': 12,
    'size-4': 16,
    'size-5': 20,
    'size-6': 24,
    'size-8': 32,
    'size-12': 48,
}

def extract_size(classname):
    """Extract icon size from className"""
    for pattern, size in SIZE_MAP.items():
        if pattern in classname:
            return size
    return 24  # default

def remove_size_classes(classname):
    """Remove size classes from className"""
    result = classname
    for pattern in SIZE_MAP.keys():
        result = result.replace(pattern, '')
    # Clean up extra spaces
    result = ' '.join(result.split())
    return result.strip()

def migrate_file(filepath):
    """Migrate a single file from Lucide to Icon component"""
    print(f"\n{'='*60}")
    print(f"Migrating: {filepath}")
    print('='*60)

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Find all Lucide imports
    import_pattern = r'import\s+{([^}]+)}\s+from\s+["\']lucide-react["\']'
    matches = list(re.finditer(import_pattern, content))

    if not matches:
        print("  ℹ️  No Lucide imports found")
        return False

    # Extract icon names
    icon_names = []
    for match in matches:
        imports = match.group(1)
        names = [name.strip() for name in imports.split(',')]
        icon_names.extend(names)

    print(f"  📦 Found {len(icon_names)} icons:")
    for i, icon in enumerate(icon_names, 1):
        print(f"     {i}. {icon}")

    # Remove all Lucide imports
    content = re.sub(import_pattern, '', content)

    # Add Icon component import if not present
    if 'from "@/components/ui/icon"' not in content:
        # Find last import line
        import_lines = [m.start() for m in re.finditer(r'^import ', content, re.MULTILINE)]
        if import_lines:
            last_import = import_lines[-1]
            # Find end of that line
            next_newline = content.find('\n', last_import)
            if next_newline != -1:
                content = (content[:next_newline + 1] +
                          'import { Icon } from "@/components/ui/icon"\n' +
                          content[next_newline + 1:])

    # Replace icon usages
    replacements = 0
    for icon_name in icon_names:
        # Pattern 1: <IconName className="..." />
        pattern1 = rf'<{icon_name}\s+className=["\']([^"\']+)["\']\s*/>'

        def replace_with_class(match):
            nonlocal replacements
            classname = match.group(1)
            size = extract_size(classname)
            clean_class = remove_size_classes(classname)
            class_attr = f' className="{clean_class}"' if clean_class else ''
            replacements += 1
            return f'<Icon name="{icon_name}" size={{{size}}}{class_attr} />'

        content = re.sub(pattern1, replace_with_class, content)

        # Pattern 2: <IconName />
        pattern2 = rf'<{icon_name}\s*/>'

        def replace_no_class(match):
            nonlocal replacements
            replacements += 1
            return f'<Icon name="{icon_name}" size={{24}} />'

        content = re.sub(pattern2, replace_no_class, content)

        # Pattern 3: <IconName className="..."> (self-closing tag with just className)
        pattern3 = rf'<{icon_name}\s+className=["\']([^"\']+)["\']\s*>'

        def replace_opening(match):
            nonlocal replacements
            classname = match.group(1)
            size = extract_size(classname)
            clean_class = remove_size_classes(classname)
            class_attr = f' className="{clean_class}"' if clean_class else ''
            replacements += 1
            return f'<Icon name="{icon_name}" size={{{size}}}{class_attr}>'

        content = re.sub(pattern3, replace_opening, content)

        # Pattern 4: <IconName> (bare tag)
        pattern4 = rf'<{icon_name}\s*>'

        def replace_bare(match):
            nonlocal replacements
            replacements += 1
            return f'<Icon name="{icon_name}" size={{24}}>'

        content = re.sub(pattern4, replace_bare, content)

    # Clean up multiple blank lines
    content = re.sub(r'\n\n\n+', '\n\n', content)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✅ Migrated successfully ({replacements} icon replacements)")
        return True

    print("  ⚠️  No changes made")
    return False

def main():
    """Main migration function"""
    if len(sys.argv) < 2:
        print("Usage: python3 migrate_icons.py <file1.tsx> <file2.tsx> ...")
        print("   or: python3 migrate_icons.py <directory>")
        sys.exit(1)

    files_to_migrate = []

    for arg in sys.argv[1:]:
        path = Path(arg)
        if path.is_file() and path.suffix == '.tsx':
            files_to_migrate.append(path)
        elif path.is_dir():
            files_to_migrate.extend(path.rglob('*.tsx'))

    if not files_to_migrate:
        print("No .tsx files found to migrate")
        sys.exit(1)

    print(f"\n{'='*60}")
    print(f"Found {len(files_to_migrate)} files to process")
    print('='*60)

    migrated_count = 0
    for filepath in files_to_migrate:
        # Skip icon.tsx itself
        if 'icon.tsx' in str(filepath) and 'ui' in str(filepath):
            continue
        if migrate_file(filepath):
            migrated_count += 1

    print(f"\n{'='*60}")
    print(f"✅ Migration complete!")
    print(f"   Migrated: {migrated_count} files")
    print(f"   Skipped: {len(files_to_migrate) - migrated_count} files")
    print('='*60)

if __name__ == '__main__':
    main()
