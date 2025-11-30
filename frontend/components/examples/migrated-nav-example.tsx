/**
 * Example: Migrated Navigation Component
 *
 * This demonstrates how to migrate from Lucide icons to the universal Icon component.
 * This pattern can be applied to any component in your project.
 */

"use client"

import { Icon } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"

/**
 * BEFORE Migration (using Lucide directly):
 *
 * 
 *
 * export function OldNavigation() {
 *   return (
 *     <nav>
 *       <a href="/"><Home size={20} /> Home</a>
 *       <a href="/profile"><User size={20} /> Profile</a>
 *       <a href="/settings"><Settings size={20} /> Settings</a>
 *       <button><LogOut size={20} /> Logout</button>
 *     </nav>
 *   )
 * }
 */

/**
 * AFTER Migration (using universal Icon component):
 */
export function MigratedNavigation() {
  return (
    <nav className="flex flex-col gap-2 p-4">
      <a
        href="/"
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent"
      >
        <Icon name="Home" size={20} />
        <span>Home</span>
      </a>

      <a
        href="/profile"
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent"
      >
        <Icon name="User" size={20} />
        <span>Profile</span>
      </a>

      <a
        href="/settings"
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent"
      >
        <Icon name="Settings" size={20} variant="solid" />
        <span>Settings</span>
      </a>

      <Button variant="ghost" className="justify-start gap-2">
        <Icon name="LogOut" size={20} />
        <span>Logout</span>
      </Button>
    </nav>
  )
}

/**
 * Benefits of Migration:
 * 1. ✅ Automatic fallback to Lucide if HugeIcons not found
 * 2. ✅ Cleaner imports (one import vs many)
 * 3. ✅ Support for HugeIcons variants (solid, bulk, duotone, etc.)
 * 4. ✅ Zero UI breaks during migration
 * 5. ✅ Easy to track progress with Icon Checker
 */

/**
 * Advanced Example: With different variants
 */
export function AdvancedMigratedNav() {
  return (
    <div className="space-y-4 p-4">
      <h3 className="font-semibold">Different Icon Variants</h3>

      <div className="flex gap-4">
        <div className="flex flex-col items-center gap-2">
          <Icon name="Home" size={32} variant="stroke" />
          <span className="text-xs">Stroke</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Icon name="Home" size={32} variant="solid" />
          <span className="text-xs">Solid</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Icon name="Home" size={32} variant="bulk" />
          <span className="text-xs">Bulk</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Icon name="Home" size={32} variant="duotone" />
          <span className="text-xs">Duotone</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Migration Steps for Your Components:
 *
 * 1. Replace icon imports:
 *    FROM: 
 *    TO:   import { Icon } from "@/components/ui/icon"
 *
 * 2. Replace icon usage:
 *    FROM: <Home size={20} />
 *    TO:   <Icon name="Home" size={20} />
 *
 * 3. Test the component
 *
 * 4. Check Icon Checker to verify progress
 */
