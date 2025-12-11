"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Icon } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useMutation } from "@tanstack/react-query"
import { invitationApi } from "@/lib/api/tenants"
import { toast } from "sonner"

export const dynamic = 'force-dynamic'

function AcceptInvitationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const invitationToken = searchParams.get("token")

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    password: "",
    confirm_password: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Accept invitation mutation
  const acceptMutation = useMutation({
    mutationFn: () => {
      if (!invitationToken) throw new Error("No invitation token provided")
      const { confirm_password, ...data } = formData
      return invitationApi.acceptInvitation({
        invitation_token: invitationToken,
        ...data,
      })
    },
    onSuccess: (data) => {
      // Store tokens
      localStorage.setItem('access_token', data.tokens.access)
      localStorage.setItem('refresh_token', data.tokens.refresh)

      toast.success(`Welcome to ${data.tenant.name}!`)

      // Redirect to dashboard
      router.push("/dashboard")
    },
    onError: (error: any) => {
      const errorData = error.response?.data
      if (errorData && typeof errorData === 'object') {
        setErrors(errorData)
        Object.keys(errorData).forEach((key) => {
          const message = Array.isArray(errorData[key]) ? errorData[key][0] : errorData[key]
          toast.error(`${key}: ${message}`)
        })
      } else {
        toast.error("Failed to accept invitation")
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validate
    const newErrors: Record<string, string> = {}

    if (!formData.first_name) newErrors.first_name = "First name is required"
    if (!formData.last_name) newErrors.last_name = "Last name is required"
    if (!formData.password) newErrors.password = "Password is required"
    if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters"
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    acceptMutation.mutate()
  }

  if (!invitationToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-black p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              No invitation token was provided
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/">Go to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-black p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Icon name="Building2" size={32} className="text-blue-600 dark:text-blue-400" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">Nalar</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Accept Invitation
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete your profile to join the team
          </p>
        </div>

        {/* Accept Form */}
        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
            <CardDescription>
              Set up your account to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    placeholder="Jane"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    autoFocus
                  />
                  {errors.first_name && (
                    <p className="text-sm text-destructive">{errors.first_name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    placeholder="Doe"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                  {errors.last_name && (
                    <p className="text-sm text-destructive">{errors.last_name}</p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters
                </p>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm Password *</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                />
                {errors.confirm_password && (
                  <p className="text-sm text-destructive">{errors.confirm_password}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={acceptMutation.isPending}
              >
                {acceptMutation.isPending && (
                  <Icon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                )}
                Accept Invitation & Join
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex gap-3">
            <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                You've been invited to join an organization
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                After accepting, you'll have access to all the tools and features available to your team.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            By accepting, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">Terms of Service</a> and{" "}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-black">
        <Icon name="Loader2" className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <AcceptInvitationContent />
    </Suspense>
  )
}
