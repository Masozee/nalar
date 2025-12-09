"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Icon } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useMutation } from "@tanstack/react-query"
import { registrationApi } from "@/lib/api/tenants"
import { toast } from "sonner"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    organization_name: "",
    email: "",
    password: "",
    confirm_password: "",
    user_first_name: "",
    user_last_name: "",
    plan: "free" as "free" | "starter" | "professional" | "enterprise",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: () => {
      const { confirm_password, ...data } = formData
      return registrationApi.registerOrganization(data)
    },
    onSuccess: (data) => {
      toast.success(`Welcome to ${data.tenant.name}!`)
      // Redirect to login or dashboard
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
        toast.error("Failed to register organization")
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validate
    const newErrors: Record<string, string> = {}

    if (!formData.organization_name) newErrors.organization_name = "Organization name is required"
    if (!formData.email) newErrors.email = "Email is required"
    if (!formData.password) newErrors.password = "Password is required"
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match"
    }
    if (!formData.user_first_name) newErrors.user_first_name = "First name is required"
    if (!formData.user_last_name) newErrors.user_last_name = "Last name is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    registerMutation.mutate()
  }

  const planDetails = {
    free: {
      name: "Free",
      price: "$0",
      description: "Perfect for trying out Nalar",
      features: ["5 team members", "Core modules", "Community support"],
    },
    starter: {
      name: "Starter",
      price: "$49",
      description: "For small research teams",
      features: ["20 team members", "All modules", "Email support", "Grant management"],
    },
    professional: {
      name: "Professional",
      price: "$149",
      description: "For growing organizations",
      features: ["100 team members", "All modules", "Priority support", "Custom branding", "Advanced analytics"],
    },
    enterprise: {
      name: "Enterprise",
      price: "$499",
      description: "For large institutions",
      features: ["Unlimited users", "All modules", "Dedicated support", "Custom integrations", "SLA guarantee"],
    },
  }

  const selectedPlanDetails = planDetails[formData.plan]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-black p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Icon name="Building2" size={32} className="text-blue-600 dark:text-blue-400" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">Nalar</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Create Your Organization
          </h1>
          <p className="text-muted-foreground mt-2">
            Start managing your research, donors, and impact in minutes
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Registration Form */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>
                Fill in your information to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Organization Name */}
                <div className="space-y-2">
                  <Label htmlFor="organization_name">Organization Name *</Label>
                  <Input
                    id="organization_name"
                    placeholder="Acme Research Institute"
                    value={formData.organization_name}
                    onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                  />
                  {errors.organization_name && (
                    <p className="text-sm text-destructive">{errors.organization_name}</p>
                  )}
                </div>

                {/* Your Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="user_first_name">First Name *</Label>
                    <Input
                      id="user_first_name"
                      placeholder="Jane"
                      value={formData.user_first_name}
                      onChange={(e) => setFormData({ ...formData, user_first_name: e.target.value })}
                    />
                    {errors.user_first_name && (
                      <p className="text-sm text-destructive">{errors.user_first_name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user_last_name">Last Name *</Label>
                    <Input
                      id="user_last_name"
                      placeholder="Doe"
                      value={formData.user_last_name}
                      onChange={(e) => setFormData({ ...formData, user_last_name: e.target.value })}
                    />
                    {errors.user_last_name && (
                      <p className="text-sm text-destructive">{errors.user_last_name}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jane@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                  </div>
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
                </div>

                {/* Plan Selection */}
                <div className="space-y-2">
                  <Label htmlFor="plan">Select Plan</Label>
                  <Select
                    value={formData.plan}
                    onValueChange={(value: any) => setFormData({ ...formData, plan: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free - $0/month</SelectItem>
                      <SelectItem value="starter">Starter - $49/month</SelectItem>
                      <SelectItem value="professional">Professional - $149/month</SelectItem>
                      <SelectItem value="enterprise">Enterprise - $499/month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending && (
                    <Icon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Create Organization
                </Button>

                {/* Login Link */}
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/dashboard" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Plan Summary */}
          <Card>
            <CardHeader>
              <CardTitle>{selectedPlanDetails.name} Plan</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold text-foreground">{selectedPlanDetails.price}</span>
                <span className="text-muted-foreground">/month</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {selectedPlanDetails.description}
              </p>
              <div className="space-y-2">
                {selectedPlanDetails.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Icon name="CheckCircle" size={16} className="text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              {formData.plan === "free" && (
                <div className="pt-4">
                  <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Icon name="Info" size={16} className="text-blue-600 dark:text-blue-400" />
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Start with Free, upgrade anytime
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            By creating an account, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">Terms of Service</a> and{" "}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}
