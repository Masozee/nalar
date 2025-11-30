#!/usr/bin/env node

/**
 * Automated Icon Migration Script
 * Migrates Lucide React imports to universal Icon component
 */

const fs = require('fs');
const path = require('path');

// Icon size mapping based on className patterns
const sizeMap = {
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
};

function migrateFile(filePath) {
  console.log(`\nMigrating: ${filePath}`);

  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;

  // Extract Lucide imports
  const lucideImportRegex = /import\s+{([^}]+)}\s+from\s+["']lucide-react["']/g;
  const matches = [...content.matchAll(lucideImportRegex)];

  if (matches.length === 0) {
    console.log('  No Lucide imports found');
    return false;
  }

  // Extract all icon names from imports
  const iconNames = [];
  matches.forEach(match => {
    const imports = match[1].split(',').map(i => i.trim());
    iconNames.push(...imports);
  });

  console.log(`  Found ${iconNames.length} icons: ${iconNames.join(', ')}`);

  // Remove Lucide imports
  content = content.replace(lucideImportRegex, '');

  // Add Icon component import if not present
  if (!content.includes('from "@/components/ui/icon"')) {
    // Find the last import statement
    const lastImportIndex = content.lastIndexOf('import ');
    const nextLineIndex = content.indexOf('\n', lastImportIndex);

    if (nextLineIndex !== -1) {
      content = content.slice(0, nextLineIndex + 1) +
        'import { Icon } from "@/components/ui/icon"\n' +
        content.slice(nextLineIndex + 1);
    }
  }

  // Replace each icon usage
  iconNames.forEach(iconName => {
    // Pattern 1: <IconName className="..." />
    const pattern1 = new RegExp(`<${iconName}\\s+className=["']([^"']+)["']\\s*/>`, 'g');
    content = content.replace(pattern1, (match, className) => {
      const size = extractSize(className);
      const cleanClass = removeSize(className);
      const classAttr = cleanClass ? ` className="${cleanClass}"` : '';
      return `<Icon name="${iconName}" size={${size}}${classAttr} />`;
    });

    // Pattern 2: <IconName />
    const pattern2 = new RegExp(`<${iconName}\\s*/>`, 'g');
    content = content.replace(pattern2, `<Icon name="${iconName}" size={24} />`);

    // Pattern 3: <IconName className="..." > (with children - rare)
    const pattern3 = new RegExp(`<${iconName}\\s+className=["']([^"']+)["']`, 'g');
    content = content.replace(pattern3, (match, className) => {
      const size = extractSize(className);
      const cleanClass = removeSize(className);
      const classAttr = cleanClass ? ` className="${cleanClass}"` : '';
      return `<Icon name="${iconName}" size={${size}}${classAttr}`;
    });
  });

  // Clean up multiple blank lines
  content = content.replace(/\n\n\n+/g, '\n\n');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('  ✅ Migrated successfully');
    return true;
  }

  console.log('  ⚠️  No changes made');
  return false;
}

function extractSize(className) {
  for (const [pattern, size] of Object.entries(sizeMap)) {
    if (className.includes(pattern)) {
      return size;
    }
  }
  return 24; // default size
}

function removeSize(className) {
  let result = className;
  Object.keys(sizeMap).forEach(pattern => {
    result = result.replace(pattern, '').trim();
  });
  return result.replace(/\s+/g, ' ').trim();
}

// Get files from command line or use default pattern
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: node migrate-icons.js <file1> <file2> ...');
  console.log('   or: node migrate-icons.js app/**/*.tsx');
  process.exit(1);
}

let migratedCount = 0;
args.forEach(filePath => {
  if (fs.existsSync(filePath) && filePath.endsWith('.tsx')) {
    if (migrateFile(filePath)) {
      migratedCount++;
    }
  }
});

console.log(`\n✅ Migration complete! ${migratedCount} files migrated.`);
