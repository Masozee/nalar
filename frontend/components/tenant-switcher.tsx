"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { tenantSwitchApi, type AvailableTenant } from "@/lib/api/tenants"
import { Icon } from "@/components/ui/icon"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export function TenantSwitcher() {
  const router = useRouter()
  const { user, currentTenant } = useAuth()
  const queryClient = useQueryClient()

  // Fetch available tenants
  const { data: tenants, isLoading } = useQuery({
    queryKey: ['available-tenants'],
    queryFn: () => tenantSwitchApi.getAvailableTenants(),
    enabled: !!user,
  })

  // Switch tenant mutation
  const switchMutation = useMutation({
    mutationFn: (tenantId: string) => tenantSwitchApi.switchTenant(tenantId),
    onSuccess: (data) => {
      // Update tokens in localStorage
      localStorage.setItem('access_token', data.tokens.access)
      localStorage.setItem('refresh_token', data.tokens.refresh)

      // Invalidate all queries
      queryClient.invalidateQueries()

      // Show success message
      toast.success(`Switched to ${data.tenant.name}`)

      // Reload the page to apply new tenant context
      window.location.reload()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to switch tenant')
    },
  })

  if (!user || !tenants || tenants.length <= 1) {
    return null // Don't show if user only has one tenant
  }

  const handleSwitch = (tenantId: string) => {
    if (currentTenant?.id === tenantId) return
    switchMutation.mutate(tenantId)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-between">
          <div className="flex items-center gap-2 truncate">
            <Icon name="Building2" size={16} />
            <span className="truncate">{currentTenant?.name || 'Select Organization'}</span>
          </div>
          <Icon name="ChevronsUpDown" size={16} className="ml-2 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
          <DropdownMenuItem disabled>
            <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
            Loading...
          </DropdownMenuItem>
        ) : (
          tenants.map((tenant) => (
            <DropdownMenuItem
              key={tenant.id}
              onClick={() => handleSwitch(tenant.id)}
              disabled={switchMutation.isPending}
              className="cursor-pointer"
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  {currentTenant?.id === tenant.id && (
                    <Icon name="Check" size={16} className="text-primary" />
                  )}
                  <span className="truncate">{tenant.name}</span>
                </div>
                {tenant.is_owner && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Owner
                  </Badge>
                )}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
