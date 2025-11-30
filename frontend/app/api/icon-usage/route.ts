/**
 * API Route: Icon Usage Scanner
 *
 * Scans all .tsx files in the project to find Lucide icon usage
 * Returns a list of icons that are still using Lucide imports
 *
 * Endpoint: GET /api/icon-usage
 */

import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

interface IconUsage {
  icon: string
  count: number
  files: string[]
}

interface ScanResult {
  totalFiles: number
  filesWithIcons: number
  lucideIcons: IconUsage[]
  hugeIcons: IconUsage[]
  directIconUsage: IconUsage[]
  timestamp: string
}

/**
 * Recursively find all .tsx and .ts files in a directory
 */
async function findTsxFiles(dir: string, fileList: string[] = []): Promise<string[]> {
  try {
    const files = await fs.readdir(dir, { withFileTypes: true })

    for (const file of files) {
      const filePath = path.join(dir, file.name)

      // Skip node_modules, .next, and other build directories
      if (
        file.name === "node_modules" ||
        file.name === ".next" ||
        file.name === ".git" ||
        file.name === "dist" ||
        file.name === "build"
      ) {
        continue
      }

      if (file.isDirectory()) {
        await findTsxFiles(filePath, fileList)
      } else if (file.name.endsWith(".tsx") || file.name.endsWith(".ts")) {
        fileList.push(filePath)
      }
    }
  } catch (error) {
    // Silently skip directories we can't read
    console.error(`Error reading directory ${dir}:`, error)
  }

  return fileList
}

/**
 * Extract icon names from import statements
 */
function extractIconsFromImports(content: string, library: "lucide" | "huge"): Set<string> {
  const icons = new Set<string>()
  const importPattern =
    library === "lucide"
      ? /import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/g
      : /import\s+{([^}]+)}\s+from\s+['"]hugeicons-react['"]/g

  let match
  while ((match = importPattern.exec(content)) !== null) {
    const imports = match[1]
    // Split by comma and clean up
    const iconNames = imports
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name && !name.startsWith("type "))

    iconNames.forEach((name) => icons.add(name))
  }

  return icons
}

/**
 * Extract Icon component usage from JSX
 */
function extractDirectIconUsage(content: string): Set<string> {
  const icons = new Set<string>()

  // Match <Icon name="IconName" />
  const namePattern = /<Icon\s+[^>]*name=["']([^"']+)["']/g
  let match
  while ((match = namePattern.exec(content)) !== null) {
    icons.add(match[1])
  }

  return icons
}

/**
 * Scan a single file for icon usage
 */
async function scanFile(
  filePath: string,
  projectRoot: string
): Promise<{
  lucideIcons: Set<string>
  hugeIcons: Set<string>
  directIcons: Set<string>
}> {
  try {
    const content = await fs.readFile(filePath, "utf-8")
    const relativePath = path.relative(projectRoot, filePath)

    return {
      lucideIcons: extractIconsFromImports(content, "lucide"),
      hugeIcons: extractIconsFromImports(content, "huge"),
      directIcons: extractDirectIconUsage(content),
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error)
    return {
      lucideIcons: new Set(),
      hugeIcons: new Set(),
      directIcons: new Set(),
    }
  }
}

/**
 * Main API handler
 */
export async function GET(request: NextRequest) {
  try {
    // Get project root (assuming this file is in app/api/icon-usage)
    const projectRoot = path.join(process.cwd())

    // Find all .tsx files
    const files = await findTsxFiles(projectRoot)

    // Track icon usage
    const lucideUsage = new Map<string, { count: number; files: string[] }>()
    const hugeUsage = new Map<string, { count: number; files: string[] }>()
    const directUsage = new Map<string, { count: number; files: string[] }>()

    let filesWithIcons = 0

    // Scan each file
    for (const file of files) {
      const { lucideIcons, hugeIcons, directIcons } = await scanFile(file, projectRoot)
      const relativePath = path.relative(projectRoot, file)

      let hasIcons = false

      // Track Lucide icons
      lucideIcons.forEach((icon) => {
        hasIcons = true
        const existing = lucideUsage.get(icon) || { count: 0, files: [] }
        existing.count++
        if (!existing.files.includes(relativePath)) {
          existing.files.push(relativePath)
        }
        lucideUsage.set(icon, existing)
      })

      // Track HugeIcons
      hugeIcons.forEach((icon) => {
        hasIcons = true
        const existing = hugeUsage.get(icon) || { count: 0, files: [] }
        existing.count++
        if (!existing.files.includes(relativePath)) {
          existing.files.push(relativePath)
        }
        hugeUsage.set(icon, existing)
      })

      // Track direct Icon usage
      directIcons.forEach((icon) => {
        hasIcons = true
        const existing = directUsage.get(icon) || { count: 0, files: [] }
        existing.count++
        if (!existing.files.includes(relativePath)) {
          existing.files.push(relativePath)
        }
        directUsage.set(icon, existing)
      })

      if (hasIcons) filesWithIcons++
    }

    // Convert Maps to sorted arrays
    const lucideIconsArray = Array.from(lucideUsage.entries())
      .map(([icon, data]) => ({ icon, ...data }))
      .sort((a, b) => b.count - a.count)

    const hugeIconsArray = Array.from(hugeUsage.entries())
      .map(([icon, data]) => ({ icon, ...data }))
      .sort((a, b) => b.count - a.count)

    const directIconsArray = Array.from(directUsage.entries())
      .map(([icon, data]) => ({ icon, ...data }))
      .sort((a, b) => b.count - a.count)

    const result: ScanResult = {
      totalFiles: files.length,
      filesWithIcons,
      lucideIcons: lucideIconsArray,
      hugeIcons: hugeIconsArray,
      directIconUsage: directIconsArray,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error scanning icons:", error)
    return NextResponse.json(
      {
        error: "Failed to scan icon usage",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
