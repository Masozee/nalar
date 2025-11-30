/**
 * HugeIcons Icon Wrapper Component
 *
 * Provides a consistent interface for using HugeIcons across the app
 * - Type-safe and easy to use
 * - Supports all HugeIcons variants (stroke, solid, bulk, duotone, twotone)
 */

import React from "react"
import * as HugeIcons from "hugeicons-react"
import { iconMap } from "./icon-map"

// Type for HugeIcons props
type HugeIconProps = {
  size?: number
  color?: string
  variant?: "stroke" | "solid" | "bulk" | "duotone" | "twotone"
}

// Icon component props
export interface IconProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  name: string
  size?: number | string
  color?: string
  variant?: "stroke" | "solid" | "bulk" | "duotone" | "twotone"
  className?: string
}

/**
 * Convert props to HugeIcons-style props
 */
function convertPropsForHugeIcons(props: IconProps): HugeIconProps {
  return {
    size: typeof props.size === "number" ? props.size : props.size === "string" ? parseInt(props.size) : 24,
    color: props.color || "currentColor",
    variant: props.variant || "stroke",
  }
}

/**
 * Get icon component from HugeIcons
 */
function getHugeIcon(name: string): React.ComponentType<any> | null {
  // Try exact match first
  const exactMatch = (HugeIcons as any)[name]
  if (exactMatch) return exactMatch

  // Try with "Icon" suffix (common HugeIcons pattern)
  const withIconSuffix = (HugeIcons as any)[`${name}Icon`]
  if (withIconSuffix) return withIconSuffix

  // Try mapped name from iconMap
  const mappedName = iconMap[name as keyof typeof iconMap]
  if (mappedName) {
    const mapped = (HugeIcons as any)[mappedName]
    if (mapped) return mapped
  }

  return null
}

/**
 * Icon Component
 *
 * @example
 * // Basic usage
 * <Icon name="Home" size={24} />
 *
 * @example
 * // With HugeIcons variant
 * <Icon name="Home" variant="solid" size={24} />
 */
export function Icon({
  name,
  size = 24,
  color,
  variant = "stroke",
  className,
  ...rest
}: IconProps) {
  const HugeIcon = getHugeIcon(name)

  if (HugeIcon) {
    const hugeProps = convertPropsForHugeIcons({ name, size, color, variant, className, ...rest })
    return (
      <HugeIcon
        {...hugeProps}
        className={className}
        style={{ display: "inline-block", verticalAlign: "middle" }}
      />
    )
  }

  // Fallback: show a placeholder
  if (process.env.NODE_ENV === "development") {
    console.warn(`Icon "${name}" not found in HugeIcons`)
  }

  return (
    <div
      className={className}
      style={{
        display: "inline-block",
        width: typeof size === "number" ? size : "1em",
        height: typeof size === "number" ? size : "1em",
        backgroundColor: "#ddd",
        borderRadius: "2px",
        verticalAlign: "middle",
      }}
      title={`Missing icon: ${name}`}
    />
  )
}

/**
 * Type-safe icon name helper (for autocomplete)
 */
export type IconName = keyof typeof HugeIcons | keyof typeof iconMap

/**
 * Utility to check if an icon exists
 */
export function iconExists(name: string): boolean {
  return getHugeIcon(name) !== null
}

/**
 * Get all available icon names from HugeIcons
 */
export function getAvailableIcons(): {
  huge: string[]
  mapped: Record<string, string>
} {
  return {
    huge: Object.keys(HugeIcons),
    mapped: iconMap,
  }
}
