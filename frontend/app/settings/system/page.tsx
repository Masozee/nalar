"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api/client"
import { TopNavbar } from "@/components/top-navbar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icon } from "@/components/ui/icon"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface SystemSettings {
  // General Settings
  system_name: string
  system_email: string
  support_email: string
  timezone: string
  date_format: string
  time_format: string
  language: string

  // Security Settings
  two_factor_required: boolean
  password_expiry_days: number
  session_timeout_minutes: number
  ip_whitelist_enabled: boolean
  allowed_ips: string

  // Email Settings
  email_notifications_enabled: boolean
  smtp_host: string
  smtp_port: number
  smtp_username: string
  smtp_use_tls: boolean

  // Feature Flags
  enable_api_access: boolean
  enable_webhooks: boolean
  enable_exports: boolean
  enable_imports: boolean

  // Maintenance
  maintenance_mode: boolean
  maintenance_message: string
}

export default function SystemConfigPage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<SystemSettings>({
    system_name: "",
    system_email: "",
    support_email: "",
    timezone: "UTC",
    date_format: "YYYY-MM-DD",
    time_format: "24h",
    language: "en",
    two_factor_required: false,
    password_expiry_days: 90,
    session_timeout_minutes: 30,
    ip_whitelist_enabled: false,
    allowed_ips: "",
    email_notifications_enabled: true,
    smtp_host: "",
    smtp_port: 587,
    smtp_username: "",
    smtp_use_tls: true,
    enable_api_access: true,
    enable_webhooks: false,
    enable_exports: true,
    enable_imports: true,
    maintenance_mode: false,
    maintenance_message: "",
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const data = await apiClient.get<SystemSettings>("/system/settings/")
      setSettings({ ...settings, ...data })
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await apiClient.put("/system/settings/", settings)
      alert("Settings saved successfully!")
    } catch (error: any) {
      console.error("Failed to save settings:", error)
      alert(`Error: ${error.message || "Failed to save settings"}`)
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: keyof SystemSettings, value: any) => {
    setSettings({ ...settings, [key]: value })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icon name="Loader2" className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading system settings...</span>
      </div>
    )
  }

  return (
    <>
      <header className="bg-background sticky top-0 flex shrink-0 items-center justify-between gap-2 border-b p-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>System Configuration</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <TopNavbar />
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Configuration</h1>
            <p className="text-muted-foreground">
              Manage system-wide settings and preferences
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Icon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Icon name="Save" className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Basic system configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="system_name">System Name</Label>
              <Input
                id="system_name"
                value={settings.system_name}
                onChange={(e) => updateSetting("system_name", e.target.value)}
                placeholder="My Organization"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="system_email">System Email</Label>
              <Input
                id="system_email"
                type="email"
                value={settings.system_email}
                onChange={(e) => updateSetting("system_email", e.target.value)}
                placeholder="system@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="support_email">Support Email</Label>
              <Input
                id="support_email"
                type="email"
                value={settings.support_email}
                onChange={(e) => updateSetting("support_email", e.target.value)}
                placeholder="support@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={settings.timezone}
                onValueChange={(value) => updateSetting("timezone", value)}
              >
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="Europe/London">London</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_format">Date Format</Label>
              <Select
                value={settings.date_format}
                onValueChange={(value) => updateSetting("date_format", value)}
              >
                <SelectTrigger id="date_format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time_format">Time Format</Label>
              <Select
                value={settings.time_format}
                onValueChange={(value) => updateSetting("time_format", value)}
              >
                <SelectTrigger id="time_format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24 Hour</SelectItem>
                  <SelectItem value="12h">12 Hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>Security and access control configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Force all users to enable 2FA
              </p>
            </div>
            <Switch
              checked={settings.two_factor_required}
              onCheckedChange={(checked) => updateSetting("two_factor_required", checked)}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password_expiry">Password Expiry (days)</Label>
              <Input
                id="password_expiry"
                type="number"
                value={settings.password_expiry_days}
                onChange={(e) => updateSetting("password_expiry_days", parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
              <Input
                id="session_timeout"
                type="number"
                value={settings.session_timeout_minutes}
                onChange={(e) => updateSetting("session_timeout_minutes", parseInt(e.target.value))}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>IP Whitelist</Label>
                <p className="text-sm text-muted-foreground">
                  Only allow access from specific IP addresses
                </p>
              </div>
              <Switch
                checked={settings.ip_whitelist_enabled}
                onCheckedChange={(checked) => updateSetting("ip_whitelist_enabled", checked)}
              />
            </div>

            {settings.ip_whitelist_enabled && (
              <div className="space-y-2">
                <Label htmlFor="allowed_ips">Allowed IP Addresses</Label>
                <Textarea
                  id="allowed_ips"
                  value={settings.allowed_ips}
                  onChange={(e) => updateSetting("allowed_ips", e.target.value)}
                  placeholder="192.168.1.1&#10;10.0.0.0/24"
                  rows={4}
                />
                <p className="text-sm text-muted-foreground">
                  Enter one IP address or CIDR range per line
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Email Settings</CardTitle>
          <CardDescription>Email and SMTP configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Enable system email notifications
              </p>
            </div>
            <Switch
              checked={settings.email_notifications_enabled}
              onCheckedChange={(checked) => updateSetting("email_notifications_enabled", checked)}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp_host">SMTP Host</Label>
              <Input
                id="smtp_host"
                value={settings.smtp_host}
                onChange={(e) => updateSetting("smtp_host", e.target.value)}
                placeholder="smtp.example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp_port">SMTP Port</Label>
              <Input
                id="smtp_port"
                type="number"
                value={settings.smtp_port}
                onChange={(e) => updateSetting("smtp_port", parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp_username">SMTP Username</Label>
              <Input
                id="smtp_username"
                value={settings.smtp_username}
                onChange={(e) => updateSetting("smtp_username", e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="smtp_tls"
                checked={settings.smtp_use_tls}
                onCheckedChange={(checked) => updateSetting("smtp_use_tls", checked)}
              />
              <Label htmlFor="smtp_tls">Use TLS</Label>
            </div>
          </div>

          <Button variant="outline">
            <Icon name="Mail" className="h-4 w-4 mr-2" />
            Test Email Configuration
          </Button>
        </CardContent>
      </Card>

      {/* Feature Flags */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
          <CardDescription>Enable or disable system features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>API Access</Label>
              <p className="text-sm text-muted-foreground">
                Allow programmatic API access
              </p>
            </div>
            <Switch
              checked={settings.enable_api_access}
              onCheckedChange={(checked) => updateSetting("enable_api_access", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Webhooks</Label>
              <p className="text-sm text-muted-foreground">
                Enable webhook integrations
              </p>
            </div>
            <Switch
              checked={settings.enable_webhooks}
              onCheckedChange={(checked) => updateSetting("enable_webhooks", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Data Export</Label>
              <p className="text-sm text-muted-foreground">
                Allow users to export data
              </p>
            </div>
            <Switch
              checked={settings.enable_exports}
              onCheckedChange={(checked) => updateSetting("enable_exports", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Data Import</Label>
              <p className="text-sm text-muted-foreground">
                Allow users to import data
              </p>
            </div>
            <Switch
              checked={settings.enable_imports}
              onCheckedChange={(checked) => updateSetting("enable_imports", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Mode */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Mode</CardTitle>
          <CardDescription>Control system availability</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Disable access for all non-admin users
              </p>
            </div>
            <Switch
              checked={settings.maintenance_mode}
              onCheckedChange={(checked) => updateSetting("maintenance_mode", checked)}
            />
          </div>

          {settings.maintenance_mode && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="maintenance_message">Maintenance Message</Label>
                <Textarea
                  id="maintenance_message"
                  value={settings.maintenance_message}
                  onChange={(e) => updateSetting("maintenance_message", e.target.value)}
                  placeholder="The system is currently undergoing scheduled maintenance..."
                  rows={3}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Icon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Icon name="Save" className="h-4 w-4 mr-2" />
              Save All Changes
            </>
          )}
        </Button>
      </div>
      </div>
    </>
  )
}
