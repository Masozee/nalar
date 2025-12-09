"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Icon } from "@/components/ui/icon"
import { OrganizationSettings } from "./components/organization-settings"
import { UsersRolesSettings } from "./components/users-roles-settings"
import { SubscriptionSettings } from "./components/subscription-settings"
import { SystemSettings } from "./components/system-settings"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("organization")

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your organization settings and preferences
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <Icon name="Building" className="h-4 w-4" />
            <span className="hidden sm:inline">Organization</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Icon name="Users" className="h-4 w-4" />
            <span className="hidden sm:inline">Users & Roles</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <Icon name="CreditCard" className="h-4 w-4" />
            <span className="hidden sm:inline">Subscription</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Icon name="Settings" className="h-4 w-4" />
            <span className="hidden sm:inline">System</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="space-y-4">
          <OrganizationSettings />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UsersRolesSettings />
        </TabsContent>

        <TabsContent value="subscription" className="space-y-4">
          <SubscriptionSettings />
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
