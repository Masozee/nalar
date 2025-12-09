"use client"

import { useState, useEffect } from "react"
import { TopNavbar } from "@/components/top-navbar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icon } from "@/components/ui/icon"
import { useAuth } from "@/contexts/auth-context"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQuery } from "@tanstack/react-query"
import { ApiClient } from "@/lib/api/client"
import { employeeApi } from "@/lib/api/hr"
import { toast } from "sonner"

const client = new ApiClient()

export default function AccountPage() {
  const { user, refreshUser } = useAuth()
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [facePhotoFile, setFacePhotoFile] = useState<File | null>(null)
  const [facePhotoPreview, setFacePhotoPreview] = useState<string | null>(null)

  // Fetch employee data
  const { data: employee, refetch: refetchEmployee } = useQuery({
    queryKey: ['employee', 'me'],
    queryFn: () => employeeApi.getCurrentEmployee(),
    enabled: !!user,
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: { first_name: string; last_name: string; username: string }) =>
      client.patch("/auth/profile/", data),
    onSuccess: async () => {
      toast.success("Profile updated successfully")
      await refreshUser()
      setIsEditingProfile(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to update profile")
    },
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: { old_password: string; new_password: string; new_password_confirm: string }) =>
      client.post("/auth/change-password/", data),
    onSuccess: () => {
      toast.success("Password changed successfully")
      passwordForm.reset()
      setIsChangingPassword(false)
    },
    onError: (error: any) => {
      const errors = error.response?.data
      if (errors) {
        Object.keys(errors).forEach((key) => {
          toast.error(errors[key][0] || errors[key])
        })
      } else {
        toast.error("Failed to change password")
      }
    },
  })

  // Register face mutation
  const registerFaceMutation = useMutation({
    mutationFn: (file: File) => employeeApi.registerMyFace(file),
    onSuccess: (data) => {
      toast.success(data.message)
      setFacePhotoFile(null)
      setFacePhotoPreview(null)
      refetchEmployee()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to register face")
    },
  })

  // Handle face photo file selection
  const handleFacePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFacePhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFacePhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle face photo upload
  const handleUploadFace = () => {
    if (facePhotoFile) {
      registerFaceMutation.mutate(facePhotoFile)
    }
  }

  // Profile form
  const profileForm = useForm({
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      username: user?.username || "",
    },
    onSubmit: async ({ value }) => {
      updateProfileMutation.mutate(value)
    },
  })

  // Password form
  const passwordForm = useForm({
    defaultValues: {
      old_password: "",
      new_password: "",
      new_password_confirm: "",
    },
    onSubmit: async ({ value }) => {
      changePasswordMutation.mutate(value)
    },
  })

  if (!user) {
    return (
      <div className="flex items-center justify-center p-12">
        <Icon name="Loader2" size={48} className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <header className="bg-background sticky top-0 z-10 flex shrink-0 items-center justify-between gap-2 border-b p-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Account</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <TopNavbar />
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your account information and security
          </p>
        </div>

        {/* Face Recognition for Attendance */}
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <Icon name="Scan" className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <CardTitle>Face Recognition for Attendance</CardTitle>
                <CardDescription>
                  {employee?.face_registered
                    ? "Your face is registered for attendance"
                    : "Register your face photo for attendance check-in"}
                </CardDescription>
              </div>
              {employee?.face_registered && (
                <div className="flex items-center gap-2 text-green-600">
                  <Icon name="CheckCircle" className="h-5 w-5" />
                  <span className="text-sm font-medium">Registered</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {employee?.face_registered ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {employee.face_photo && (
                    <div className="w-32 h-32 border-2 border-blue-200 rounded-lg overflow-hidden">
                      <img
                        src={employee.face_photo}
                        alt="Face photo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      Your face has been registered on{" "}
                      {employee.face_registered_at
                        ? new Date(employee.face_registered_at).toLocaleDateString()
                        : "an unknown date"}
                      . You can now use face recognition for attendance check-in.
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Icon name="Camera" className="h-4 w-4 mr-2" />
                  Update Face Photo
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Upload a clear photo of your face to enable face recognition for attendance check-in.
                  Make sure your face is well-lit and clearly visible.
                </p>
                <div className="flex items-start gap-4">
                  <div className="w-32 h-32 border-2 border-dashed border-blue-200 rounded-lg flex items-center justify-center bg-white dark:bg-gray-950 overflow-hidden">
                    {facePhotoPreview ? (
                      <img
                        src={facePhotoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon name="User" size={48} className="text-blue-300" />
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label htmlFor="face_photo" className="cursor-pointer">
                        <div className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                          <Icon name="Upload" className="h-4 w-4" />
                          <span>Choose photo</span>
                        </div>
                      </Label>
                      <Input
                        id="face_photo"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFacePhotoChange}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG or HEIC (max 5MB)
                      </p>
                    </div>
                    {facePhotoFile && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleUploadFace}
                          disabled={registerFaceMutation.isPending}
                        >
                          {registerFaceMutation.isPending && (
                            <Icon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                          )}
                          Register Face
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setFacePhotoFile(null)
                            setFacePhotoPreview(null)
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </div>
              {!isEditingProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingProfile(true)}
                >
                  <Icon name="Edit" className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                profileForm.handleSubmit()
              }}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <profileForm.Field name="first_name">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={!isEditingProfile}
                      />
                    </div>
                  )}
                </profileForm.Field>

                <profileForm.Field name="last_name">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={!isEditingProfile}
                      />
                    </div>
                  )}
                </profileForm.Field>
              </div>

              <profileForm.Field name="username">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={!isEditingProfile}
                    />
                  </div>
                )}
              </profileForm.Field>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              {isEditingProfile && (
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending && (
                      <Icon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditingProfile(false)
                      profileForm.reset()
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>View your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account ID</p>
                <p className="text-sm font-mono">{user.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Login</p>
                <p className="text-sm">
                  {user.last_login
                    ? new Date(user.last_login).toLocaleString()
                    : "Never"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account Created</p>
                <p className="text-sm">
                  {user.date_joined
                    ? new Date(user.date_joined).toLocaleDateString()
                    : "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account Status</p>
                <p className="text-sm">
                  {user.is_active ? (
                    <span className="inline-flex items-center gap-1 text-green-600">
                      <Icon name="CheckCircle" className="h-4 w-4" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-600">
                      <Icon name="XCircle" className="h-4 w-4" />
                      Inactive
                    </span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </div>
              {!isChangingPassword && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsChangingPassword(true)}
                >
                  <Icon name="Key" className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              )}
            </div>
          </CardHeader>
          {isChangingPassword && (
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  passwordForm.handleSubmit()
                }}
                className="space-y-4"
              >
                <passwordForm.Field name="old_password">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="old_password">Current Password</Label>
                      <Input
                        id="old_password"
                        type="password"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                </passwordForm.Field>

                <passwordForm.Field name="new_password">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="new_password">New Password</Label>
                      <Input
                        id="new_password"
                        type="password"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                </passwordForm.Field>

                <passwordForm.Field name="new_password_confirm">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="new_password_confirm">Confirm New Password</Label>
                      <Input
                        id="new_password_confirm"
                        type="password"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                </passwordForm.Field>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                  >
                    {changePasswordMutation.isPending && (
                      <Icon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Update Password
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsChangingPassword(false)
                      passwordForm.reset()
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>
      </div>
    </>
  )
}
