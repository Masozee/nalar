"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface Subscription {
  id: string
  plan: string
  plan_display: string
  status: string
  is_active: boolean
  current_period_end: string
  days_until_renewal: number
  billing_email: string
}

interface Plan {
  value: string
  label: string
  features: {
    max_users: number
    max_storage_gb: number
    modules: string[]
    support: string
  }
}

export function SubscriptionSettings() {
  const [loading, setLoading] = useState(false)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])

  useEffect(() => {
    fetchSubscription()
    fetchPlans()
  }, [])

  const fetchSubscription = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/v1/subscriptions/current/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSubscription(data)
      }
    } catch (error) {
      console.error("Failed to fetch subscription:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/v1/subscriptions/plans/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPlans(data)
      }
    } catch (error) {
      console.error("Failed to fetch plans:", error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Icon name="Loader2" className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading subscription...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Subscription</CardTitle>
              <CardDescription>
                Your current plan and billing information
              </CardDescription>
            </div>
            {subscription && (
              <Badge variant={subscription.is_active ? "default" : "secondary"}>
                {subscription.plan_display}
              </Badge>
            )}
          </div>
        </CardHeader>
        {subscription && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-lg font-semibold">
                  {subscription.is_active ? "Active" : "Inactive"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Renewal In</p>
                <p className="text-lg font-semibold">
                  {subscription.days_until_renewal} days
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Billing Email</p>
                <p className="text-lg font-semibold">{subscription.billing_email}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline">
                <Icon name="Download" className="h-4 w-4 mr-2" />
                Download Invoice
              </Button>
              <Button variant="outline">
                <Icon name="FileText" className="h-4 w-4 mr-2" />
                View Billing History
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Available Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <Card
            key={plan.value}
            className={
              subscription?.plan === plan.value ? "border-primary" : ""
            }
          >
            <CardHeader>
              <CardTitle>{plan.label}</CardTitle>
              <CardDescription>
                {plan.value === "free" && "For getting started"}
                {plan.value === "starter" && "For small teams"}
                {plan.value === "professional" && "For growing businesses"}
                {plan.value === "enterprise" && "For large organizations"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Users" className="h-4 w-4" />
                  <span>{plan.features.max_users} users</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="HardDrive" className="h-4 w-4" />
                  <span>{plan.features.max_storage_gb} GB storage</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Package" className="h-4 w-4" />
                  <span>
                    {plan.features.modules.length === 1 && plan.features.modules[0] === "all"
                      ? "All modules"
                      : `${plan.features.modules.length} modules`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Headphones" className="h-4 w-4" />
                  <span>{plan.features.support}</span>
                </div>
              </div>

              {subscription?.plan === plan.value ? (
                <Button className="w-full" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button className="w-full" variant="outline">
                  {plan.value === "free" ? "Downgrade" : "Upgrade"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Billing Details */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
          <CardDescription>
            Manage your payment method and billing details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Icon name="CreditCard" className="h-6 w-6" />
              <div>
                <p className="font-medium">Visa ending in 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/2025</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Update
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">
              <Icon name="Plus" className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
