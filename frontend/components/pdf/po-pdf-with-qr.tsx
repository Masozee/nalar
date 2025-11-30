'use client'

import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { POPDFDocument } from './po-pdf'
import { PurchaseOrder, POItem } from '@/lib/api/procurement'

interface POPDFWithQRProps {
  po: PurchaseOrder
  items: POItem[]
}

export function POPDFWithQR({ po, items }: POPDFWithQRProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')

  useEffect(() => {
    const generateQR = async () => {
      try {
        const verifyUrl = `${window.location.origin}/procurement/po-list/verify/${po.id}`
        const dataUrl = await QRCode.toDataURL(verifyUrl, {
          width: 200,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        })
        setQrCodeDataUrl(dataUrl)
      } catch (error) {
        console.error('Error generating QR code:', error)
      }
    }

    generateQR()
  }, [po.id])

  return <POPDFDocument po={po} items={items} qrCodeUrl={qrCodeDataUrl} />
}
