'use client'

import { useState, useEffect } from 'react'
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer'
import { POPDFWithQR } from './po-pdf-with-qr'
import { PurchaseOrder, POItem } from '@/lib/api/procurement'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

interface POPDFPreviewProps {
  po: PurchaseOrder
  items: POItem[]
  mode: 'download' | 'viewer'
}

export default function POPDFPreview({ po, items, mode }: POPDFPreviewProps) {
  const [isClient, setIsClient] = useState(false)
  const [debouncedItems, setDebouncedItems] = useState(items)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Debounce items updates to prevent rapid re-renders
  useEffect(() => {
    setIsUpdating(true)
    const timer = setTimeout(() => {
      setDebouncedItems(items)
      setIsUpdating(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [items])

  if (mode === 'download') {
    if (!isClient) {
      return (
        <Button variant="outline" disabled>
          <Icon name="Download" size={16} className="mr-2" />
          Loading...
        </Button>
      )
    }

    return (
      <PDFDownloadLink
        document={<POPDFWithQR po={po} items={items} />}
        fileName={`PO-${po.po_number}.pdf`}
      >
        {({ loading }) => (
          <Button variant="outline" disabled={loading}>
            <Icon name="Download" size={16} className="mr-2" />
            {loading ? 'Generating...' : 'Download PDF'}
          </Button>
        )}
      </PDFDownloadLink>
    )
  }

  // Only render PDFViewer on client side
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-full bg-muted">
        <p className="text-sm text-muted-foreground">Loading PDF preview...</p>
      </div>
    )
  }

  try {
    return (
      <div className="relative w-full h-full">
        {isUpdating && (
          <div className="absolute top-2 right-2 z-10 bg-blue-500 text-white text-xs px-2 py-1 rounded">
            Updating...
          </div>
        )}
        <PDFViewer width="100%" height="100%" showToolbar={true} key={debouncedItems.length}>
          <POPDFWithQR po={po} items={debouncedItems} />
        </PDFViewer>
      </div>
    )
  } catch (error) {
    console.error('PDF Viewer error:', error)
    return (
      <div className="flex items-center justify-center h-full bg-muted">
        <p className="text-sm text-muted-foreground">Error loading PDF preview</p>
      </div>
    )
  }
}
