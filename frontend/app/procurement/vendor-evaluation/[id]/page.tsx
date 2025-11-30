"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Progress } from "@/components/ui/progress"
import { vendorEvaluationApi, type VendorEvaluation } from "@/lib/api/procurement"
import { Icon } from "@/components/ui/icon"

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const getScoreColor = (score: number) => {
  if (score >= 4.5) return 'text-green-600'
  if (score >= 3.5) return 'text-blue-600'
  if (score >= 2.5) return 'text-yellow-600'
  return 'text-red-600'
}

const getScoreBgColor = (score: number) => {
  if (score >= 4.5) return 'bg-green-500'
  if (score >= 3.5) return 'bg-blue-500'
  if (score >= 2.5) return 'bg-yellow-500'
  return 'bg-red-500'
}

export default function VendorEvaluationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [evaluation, setEvaluation] = useState<VendorEvaluation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchEvaluation()
    }
  }, [params.id])

  const fetchEvaluation = async () => {
    try {
      setLoading(true)
      const data = await vendorEvaluationApi.get(params.id as string)
      setEvaluation(data)
    } catch (error) {
      console.error("Error fetching evaluation:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (score: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-6 w-6 ${i < Math.round(score) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
  }

  const ScoreCard = ({ title, score, icon: Icon }: { title: string, score: number, icon: any }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
          {score}/5
        </div>
        <Progress value={score * 20} className={getScoreBgColor(score)} />
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <SidebarProvider style={{ "--sidebar-width": "350px" } as React.CSSProperties}>
        <AppSidebar />
        <SidebarInset>
          <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <div className="text-muted-foreground">Loading...</div>
            <div className="ml-auto">
              <TopNavbar />
            </div>
          </header>
          <div className="flex flex-1 items-center justify-center p-6">
            <p className="text-muted-foreground">Loading evaluation details...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!evaluation) {
    return (
      <SidebarProvider style={{ "--sidebar-width": "350px" } as React.CSSProperties}>
        <AppSidebar />
        <SidebarInset>
          <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <div className="text-muted-foreground">Evaluation not found</div>
            <div className="ml-auto">
              <TopNavbar />
            </div>
          </header>
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
            <p className="text-muted-foreground">Evaluation not found</p>
            <Button asChild>
              <Link href="/procurement/vendor-evaluation">
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Back to Evaluations
              </Link>
            </Button>
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
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/procurement">Procurement</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/procurement/vendor-evaluation">Vendor Evaluation</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Details</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 max-w-full">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{evaluation.vendor_name}</h1>
              <p className="text-muted-foreground">
                Evaluation: {formatDate(evaluation.evaluation_date)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/procurement/vendor-evaluation/${evaluation.id}/edit`}>
                  <Icon name="Edit" size={16} className="mr-2" />
                  Edit
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/procurement/vendor-evaluation">
                  <Icon name="ArrowLeft" size={16} className="mr-2" />
                  Back
                </Link>
              </Button>
            </div>
          </div>

          {/* Overall Score Card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Overall Performance Score</span>
                <Icon name="TrendingUp" size={20} className="text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-5xl font-bold ${getScoreColor(parseFloat(evaluation.overall_score))}`}>
                    {evaluation.overall_score}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Out of 5.00</p>
                </div>
                <div>
                  {renderStars(parseFloat(evaluation.overall_score))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evaluation Period */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Calendar" size={20} />
                Evaluation Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">From</label>
                  <p className="text-lg font-medium">{formatDate(evaluation.period_start)}</p>
                </div>
                <div className="text-2xl text-muted-foreground">→</div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">To</label>
                  <p className="text-lg font-medium">{formatDate(evaluation.period_end)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Breakdown */}
          <div>
            <h2 className="text-xl font-bold mb-4">Performance Metrics</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <ScoreCard
                title="Quality Score"
                score={evaluation.quality_score}
                icon={Star}
              />
              <ScoreCard
                title="Delivery Score"
                score={evaluation.delivery_score}
                icon={TrendingUp}
              />
              <ScoreCard
                title="Price Score"
                score={evaluation.price_score}
                icon={TrendingUp}
              />
              <ScoreCard
                title="Service Score"
                score={evaluation.service_score}
                icon={User}
              />
              <ScoreCard
                title="Compliance Score"
                score={evaluation.compliance_score}
                icon={TrendingUp}
              />
            </div>
          </div>

          {/* Detailed Scores */}
          <Card>
            <CardHeader>
              <CardTitle>Score Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Quality (Kualitas produk/jasa)</span>
                    <span className={`font-bold ${getScoreColor(evaluation.quality_score)}`}>
                      {evaluation.quality_score}/5
                    </span>
                  </div>
                  <Progress value={evaluation.quality_score * 20} className={getScoreBgColor(evaluation.quality_score)} />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Delivery (Ketepatan pengiriman)</span>
                    <span className={`font-bold ${getScoreColor(evaluation.delivery_score)}`}>
                      {evaluation.delivery_score}/5
                    </span>
                  </div>
                  <Progress value={evaluation.delivery_score * 20} className={getScoreBgColor(evaluation.delivery_score)} />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Price (Kesesuaian harga)</span>
                    <span className={`font-bold ${getScoreColor(evaluation.price_score)}`}>
                      {evaluation.price_score}/5
                    </span>
                  </div>
                  <Progress value={evaluation.price_score * 20} className={getScoreBgColor(evaluation.price_score)} />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Service (Pelayanan)</span>
                    <span className={`font-bold ${getScoreColor(evaluation.service_score)}`}>
                      {evaluation.service_score}/5
                    </span>
                  </div>
                  <Progress value={evaluation.service_score * 20} className={getScoreBgColor(evaluation.service_score)} />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Compliance (Kepatuhan terhadap kontrak)</span>
                    <span className={`font-bold ${getScoreColor(evaluation.compliance_score)}`}>
                      {evaluation.compliance_score}/5
                    </span>
                  </div>
                  <Progress value={evaluation.compliance_score * 20} className={getScoreBgColor(evaluation.compliance_score)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendation */}
          {evaluation.recommendation && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{evaluation.recommendation}</p>
              </CardContent>
            </Card>
          )}

          {/* Evaluator Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="User" size={20} />
                Evaluator Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Evaluated By</label>
                  <p className="mt-1">{evaluation.evaluator_name || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Evaluation Date</label>
                  <p className="mt-1">{formatDate(evaluation.evaluation_date)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
