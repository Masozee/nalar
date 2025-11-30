"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  PaginationState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]

  // Pagination
  pageCount?: number
  pagination?: PaginationState
  onPaginationChange?: (pagination: PaginationState) => void
  manualPagination?: boolean

  // Sorting
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  manualSorting?: boolean

  // Filtering
  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void

  // Loading & Empty states
  isLoading?: boolean
  emptyMessage?: string
  loadingMessage?: string

  // Row selection
  enableRowSelection?: boolean
  onRowSelectionChange?: (selection: Record<string, boolean>) => void

  // Customization
  className?: string
  containerClassName?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount = -1,
  pagination: controlledPagination,
  onPaginationChange,
  manualPagination = false,
  sorting: controlledSorting,
  onSortingChange,
  manualSorting = false,
  columnFilters: controlledColumnFilters,
  onColumnFiltersChange,
  isLoading = false,
  emptyMessage = "No results found.",
  loadingMessage = "Loading...",
  enableRowSelection = false,
  onRowSelectionChange,
  className,
  containerClassName,
}: DataTableProps<TData, TValue>) {
  // Local state for uncontrolled mode
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [localColumnFilters, setLocalColumnFilters] = React.useState<ColumnFiltersState>([])
  const [localSorting, setLocalSorting] = React.useState<SortingState>([])
  const [localPagination, setLocalPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Use controlled or local state
  const sorting = controlledSorting ?? localSorting
  const setSorting = onSortingChange ?? setLocalSorting
  const columnFilters = controlledColumnFilters ?? localColumnFilters
  const setColumnFilters = onColumnFiltersChange ?? setLocalColumnFilters
  const pagination = controlledPagination ?? localPagination
  const setPagination = onPaginationChange ?? setLocalPagination

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    enableRowSelection,
    onRowSelectionChange: (updater) => {
      const newSelection =
        typeof updater === "function" ? updater(rowSelection) : updater
      setRowSelection(newSelection)
      onRowSelectionChange?.(newSelection)
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination,
    manualSorting,
  })

  return (
    <div className={containerClassName}>
      <div className={`rounded-lg border bg-card overflow-x-auto ${className || ""}`}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} style={{ width: header.getSize() }}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {loadingMessage}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {manualPagination && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
              <span>
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </span>
            )}
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <select
                value={pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value))
                }}
                className="h-8 w-[70px] rounded-md border border-input bg-background px-2 text-sm"
              >
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {pagination.pageIndex + 1} of {pageCount || 1}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <Icon name="ChevronsLeft" size={16} />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <Icon name="ChevronLeft" size={16} />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <Icon name="ChevronRight" size={16} />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(pageCount - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <Icon name="ChevronsRight" size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Sortable Header Component
interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: any
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={className}>{title}</div>
  }

  return (
    <div className={`flex items-center space-x-2 ${className || ""}`}>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-accent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span>{title}</span>
        {column.getIsSorted() === "desc" ? (
          <Icon name="ArrowDown" size={16} className="ml-2" />
        ) : column.getIsSorted() === "asc" ? (
          <Icon name="ArrowUp" size={16} className="ml-2" />
        ) : (
          <Icon name="ArrowUpDown" size={16} className="ml-2 opacity-50" />
        )}
      </Button>
    </div>
  )
}
