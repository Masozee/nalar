/**
 * TypeScript types for Icon Usage domain
 */

export interface IconUsage {
  icon: string
  count: number
  files: string[]
}

export interface IconScanResult {
  totalFiles: number
  filesWithIcons: number
  lucideIcons: IconUsage[]
  hugeIcons: IconUsage[]
  directIconUsage: IconUsage[]
  timestamp: string
}
