"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

import { AppSidebar } from "@/components/app-sidebar"
import { TopNavbar } from "@/components/top-navbar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { policyApi, Policy, PolicyApproval } from "@/lib/api/hr"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Icon } from "@/components/ui/icon"

const getInitials = (name?: string) => {
  if (!name) return '??'
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

export default function PolicyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [policy, setPolicy] = useState<Policy | null>(null)
  const [approvals, setApprovals] = useState<PolicyApproval[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchPolicy()
      fetchApprovals()
    }
  }, [params.id])

  const fetchPolicy = async () => {
    try {
      setLoading(true)
      const response = await policyApi.policies.get(params.id as string)
      setPolicy(response)
    } catch (error) {
      console.error("Error fetching policy:", error)
      setPolicy(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchApprovals = async () => {
    try {
      const response = await policyApi.approvals.list({ policy: params.id })
      setApprovals(response.results)
    } catch (error) {
      console.error("Error fetching approvals:", error)
      setApprovals([])
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { className: string }> = {
      draft: { className: "bg-gray-500" },
      pending_approval: { className: "bg-yellow-500" },
      approved: { className: "bg-green-500" },
      rejected: { className: "bg-red-500" },
      archived: { className: "bg-gray-400" },
    }
    const config = statusConfig[status] || statusConfig.draft
    return (
      <Badge className={config.className}>
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  const getApprovalStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Icon name="CheckCircle" size={20} className="text-green-500" />
      case 'rejected':
        return <Icon name="XCircle" size={20} className="text-red-500" />
      case 'pending':
        return <Icon name="Clock" size={20} className="text-yellow-500" />
      default:
        return <Icon name="AlertCircle" size={20} className="text-gray-500" />
    }
  }

  const handleDownload = async () => {
    if (!policy?.file_url) return
    try {
      const response = await fetch(policy.file_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = policy.file_name || `${policy.title}.txt`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading file:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="bg-background sticky top-0 flex shrink-0 items-center justify-between gap-2 border-b p-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="ml-auto">
              <TopNavbar />
            </div>
          </header>
          <div className="flex flex-1 items-center justify-center p-4">
            Loading...
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!policy) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="bg-background sticky top-0 flex shrink-0 items-center justify-between gap-2 border-b p-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="ml-auto">
              <TopNavbar />
            </div>
          </header>
          <div className="flex flex-1 items-center justify-center p-4">
            <div className="text-center">
              <p className="text-muted-foreground">Policy not found</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push('/hr/policies')}
              >
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Back to Policies
              </Button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": "350px" } as React.CSSProperties}>
      <AppSidebar />
      <SidebarInset>
        <header className="bg-background sticky top-0 flex shrink-0 items-center justify-between gap-2 border-b p-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/hr">HR</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/hr/policies">Policies</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{policy.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto">
            <TopNavbar />
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => router.push('/hr/policies')}
            className="w-fit"
          >
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Back to Policies
          </Button>

          {/* Policy Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="FileText" size={24} className="text-muted-foreground" />
                <h1 className="text-3xl font-bold">{policy.title}</h1>
              </div>
              <p className="text-muted-foreground text-lg">{policy.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled>
                {policy.status === 'pending_approval' && <Icon name="Clock" size={16} className="mr-2" />}
                {policy.status === 'approved' && <Icon name="CheckCircle" size={16} className="mr-2" />}
                {policy.status === 'rejected' && <Icon name="XCircle" size={16} className="mr-2" />}
                {policy.status === 'draft' && <Icon name="FileText" size={16} className="mr-2" />}
                {policy.status === 'archived' && <Icon name="XCircle" size={16} className="mr-2" />}
                {policy.status.replace('_', ' ')}
              </Button>
              <Button onClick={handleDownload} disabled={!policy.file_url}>
                <Icon name="Download" size={16} className="mr-2" />
                Download
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-4">
              {/* Policy Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Policy Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Version</div>
                      <div className="font-mono font-medium">{policy.version}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Views</div>
                      <div className="flex items-center gap-2">
                        <Icon name="Eye" size={16} className="text-muted-foreground" />
                        <span className="font-medium">{policy.view_count}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Effective Date</div>
                      <div className="flex items-center gap-2">
                        <Icon name="Calendar" size={16} className="text-muted-foreground" />
                        <span>{formatDate(policy.effective_date)}</span>
                      </div>
                    </div>
                    {policy.expiry_date && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Expiry Date</div>
                        <div className="flex items-center gap-2">
                          <Icon name="Calendar" size={16} className="text-muted-foreground" />
                          <span>{formatDate(policy.expiry_date)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {policy.tags && policy.tags.length > 0 && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Tags</div>
                      <div className="flex flex-wrap gap-2">
                        {policy.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">
                            <Icon name="Tag" size={12} className="mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Policy Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Policy Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {policy.content.split('\n').map((line, index) => {
                      // Handle headers
                      if (line.startsWith('# ')) {
                        return <h1 key={index} className="text-2xl font-bold mt-6 mb-4">{line.substring(2)}</h1>
                      }
                      if (line.startsWith('## ')) {
                        return <h2 key={index} className="text-xl font-bold mt-5 mb-3">{line.substring(3)}</h2>
                      }
                      if (line.startsWith('### ')) {
                        return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.substring(4)}</h3>
                      }
                      // Handle list items
                      if (line.trim().startsWith('- ')) {
                        return <li key={index} className="ml-4 mb-1">{line.trim().substring(2)}</li>
                      }
                      // Handle empty lines
                      if (line.trim() === '') {
                        return <div key={index} className="h-2" />
                      }
                      // Handle regular text
                      return <p key={index} className="mb-2">{line}</p>
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Approval Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Approval Status</CardTitle>
                  {policy.approval_status && (
                    <CardDescription>
                      {policy.approval_status.approved} of {policy.approval_status.total} approved
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {approvals.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No approvals required</p>
                    ) : (
                      approvals
                        .sort((a, b) => a.order - b.order)
                        .map((approval) => (
                          <div key={approval.id} className="flex items-start gap-3">
                            <div className="mt-0.5">
                              {getApprovalStatusIcon(approval.status)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {getInitials(approval.approver_name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="font-medium text-sm truncate">
                                  {approval.approver_name || 'Unknown'}
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {approval.approver_title}
                              </div>
                              {approval.approved_at && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {formatDate(approval.approved_at)}
                                </div>
                              )}
                              {approval.comments && (
                                <div className="text-xs mt-1 p-2 bg-muted rounded">
                                  {approval.comments}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* File Information */}
              {policy.file_url && (
                <Card>
                  <CardHeader>
                    <CardTitle>Attachment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon name="FileText" size={16} className="text-muted-foreground" />
                        <span className="text-sm font-medium truncate">
                          {policy.file_name}
                        </span>
                      </div>
                      {policy.file_size && (
                        <div className="text-xs text-muted-foreground">
                          Size: {(policy.file_size / 1024).toFixed(2)} KB
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={handleDownload}
                      >
                        <Icon name="Download" size={16} className="mr-2" />
                        Download File
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Requires Acknowledgment */}
              {policy.requires_acknowledgment && (
                <Card className="border-yellow-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="AlertCircle" size={20} className="text-yellow-500" />
                      Acknowledgment Required
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      This policy requires acknowledgment from all employees.
                    </p>
                    <Button className="w-full" variant="outline">
                      Acknowledge Policy
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
