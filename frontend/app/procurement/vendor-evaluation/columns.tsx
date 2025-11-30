"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { VendorEvaluation } from "@/lib/api/procurement"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { DataTableColumnHeader } from "@/components/ui/data-table"

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getScoreColor = (score: number | string) => {
  const numScore = typeof score === 'string' ? parseFloat(score) : score
  if (numScore >= 4.5) return 'text-green-600'
  if (numScore >= 3.5) return 'text-blue-600'
  if (numScore >= 2.5) return 'text-yellow-600'
  return 'text-red-600'
}

const renderStars = (score: number) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Icon
          key={i}
          name="Star"
          size={16}
          className={i < Math.round(score) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
        />
      ))}
      <span className="ml-2 text-sm font-medium">{score.toFixed(2)}</span>
    </div>
  )
}

export const vendorEvaluationColumns: ColumnDef<VendorEvaluation>[] = [
  {
    accessorKey: "vendor_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vendor" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("vendor_name")}</span>
    ),
    size: 200,
  },
  {
    accessorKey: "evaluation_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Evaluation Date" />
    ),
    cell: ({ row }) => (
      <span className="text-sm">{formatDate(row.getValue("evaluation_date"))}</span>
    ),
    size: 120,
  },
  {
    id: "period",
    header: "Period",
    cell: ({ row }) => {
      const evaluation = row.original
      return (
        <span className="text-sm">
          {formatDate(evaluation.period_start)} - {formatDate(evaluation.period_end)}
        </span>
      )
    },
    size: 150,
  },
  {
    accessorKey: "quality_score",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Quality" className="text-center" />
    ),
    cell: ({ row }) => {
      const score = row.getValue("quality_score") as number | string
      return (
        <div className="text-center">
          <span className={`text-sm font-medium ${getScoreColor(score)}`}>
            {typeof score === 'string' ? score : score.toFixed(1)}
          </span>
        </div>
      )
    },
    size: 100,
  },
  {
    accessorKey: "delivery_score",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Delivery" className="text-center" />
    ),
    cell: ({ row }) => {
      const score = row.getValue("delivery_score") as number | string
      return (
        <div className="text-center">
          <span className={`text-sm font-medium ${getScoreColor(score)}`}>
            {typeof score === 'string' ? score : score.toFixed(1)}
          </span>
        </div>
      )
    },
    size: 100,
  },
  {
    accessorKey: "price_score",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" className="text-center" />
    ),
    cell: ({ row }) => {
      const score = row.getValue("price_score") as number | string
      return (
        <div className="text-center">
          <span className={`text-sm font-medium ${getScoreColor(score)}`}>
            {typeof score === 'string' ? score : score.toFixed(1)}
          </span>
        </div>
      )
    },
    size: 100,
  },
  {
    accessorKey: "service_score",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Service" className="text-center" />
    ),
    cell: ({ row }) => {
      const score = row.getValue("service_score") as number | string
      return (
        <div className="text-center">
          <span className={`text-sm font-medium ${getScoreColor(score)}`}>
            {typeof score === 'string' ? score : score.toFixed(1)}
          </span>
        </div>
      )
    },
    size: 100,
  },
  {
    accessorKey: "compliance_score",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Compliance" className="text-center" />
    ),
    cell: ({ row }) => {
      const score = row.getValue("compliance_score") as number | string
      return (
        <div className="text-center">
          <span className={`text-sm font-medium ${getScoreColor(score)}`}>
            {typeof score === 'string' ? score : score.toFixed(1)}
          </span>
        </div>
      )
    },
    size: 100,
  },
  {
    accessorKey: "overall_score",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Overall Score" />
    ),
    cell: ({ row }) => {
      const score = parseFloat(row.getValue("overall_score"))
      return renderStars(score)
    },
    size: 150,
  },
  {
    accessorKey: "evaluator_name",
    header: "Evaluator",
    cell: ({ row }) => {
      const name = row.getValue("evaluator_name") as string | null
      return <span className="text-sm">{name || '-'}</span>
    },
    size: 150,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const evaluation = row.original
      return (
        <div className="text-right">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/procurement/vendor-evaluation/${evaluation.id}`}>View</Link>
          </Button>
        </div>
      )
    },
    size: 80,
  },
]
