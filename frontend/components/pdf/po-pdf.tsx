import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer'
import { PurchaseOrder, POItem } from '@/lib/api/procurement'
import QRCode from 'qrcode'

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  companyInfo: {
    fontSize: 9,
    marginBottom: 5,
    color: '#666',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    borderBottom: '1 solid #ddd',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  col: {
    flex: 1,
  },
  label: {
    fontSize: 8,
    color: '#666',
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    color: '#000',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    fontWeight: 'bold',
    borderBottom: '1 solid #ddd',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #eee',
    padding: 8,
    minHeight: 30,
  },
  tableCol1: { width: '5%' },  // Line #
  tableCol2: { width: '15%' }, // Item Code
  tableCol3: { width: '30%' }, // Item Name
  tableCol4: { width: '8%' },  // Unit
  tableCol5: { width: '10%', textAlign: 'right' }, // Qty
  tableCol6: { width: '12%', textAlign: 'right' }, // Unit Price
  tableCol7: { width: '7%', textAlign: 'right' },  // Disc
  tableCol8: { width: '13%', textAlign: 'right' }, // Total
  footer: {
    marginTop: 20,
    borderTop: '2 solid #333',
  },
  footerContent: {
    paddingTop: 15,
    paddingBottom: 15,
    borderBottom: '2 solid #333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 5,
  },
  totalLabel: {
    width: '60%',
    textAlign: 'right',
    paddingRight: 10,
    fontSize: 10,
  },
  totalValue: {
    width: '13%',
    textAlign: 'right',
    fontSize: 10,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
    paddingTop: 5,
    borderTop: '1 solid #333',
  },
  grandTotalLabel: {
    width: '60%',
    textAlign: 'right',
    paddingRight: 10,
    fontSize: 12,
    fontWeight: 'bold',
  },
  grandTotalValue: {
    width: '13%',
    textAlign: 'right',
    fontSize: 12,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '4 8',
    borderRadius: 4,
    fontSize: 8,
    display: 'inline-block',
    marginLeft: 10,
  },
  notes: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  notesText: {
    fontSize: 9,
    lineHeight: 1.4,
    color: '#333',
  },
  qrContainer: {
    width: 60,
    textAlign: 'center',
    marginRight: 15,
  },
  qrCode: {
    width: 60,
    height: 60,
  },
  qrText: {
    fontSize: 5,
    color: '#666',
    marginTop: 1,
  },
})

interface POPDFProps {
  po: PurchaseOrder
  items: POItem[]
  qrCodeUrl?: string
}

const formatCurrency = (amount: string) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(parseFloat(amount))
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const statusLabels: Record<string, string> = {
  draft: 'Draf',
  pending_approval: 'Menunggu Persetujuan',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  sent: 'Dikirim ke Vendor',
  partial: 'Penerimaan Sebagian',
  received: 'Diterima Lengkap',
  cancelled: 'Dibatalkan',
  closed: 'Selesai',
}

const priorityLabels: Record<string, string> = {
  low: 'Rendah',
  normal: 'Normal',
  high: 'Tinggi',
  urgent: 'Urgent',
}

export const POPDFDocument: React.FC<POPDFProps> = ({ po, items, qrCodeUrl }) => {
  return (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>PURCHASE ORDER</Text>
        <Text style={styles.companyInfo}>Your Company Name</Text>
        <Text style={styles.companyInfo}>Company Address Line 1</Text>
        <Text style={styles.companyInfo}>Company Address Line 2</Text>
        <Text style={styles.companyInfo}>Phone: +62 xxx xxxx | Email: info@company.com</Text>
      </View>

      {/* PO Information */}
      <View style={styles.section}>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>PO Number</Text>
            <Text style={styles.value}>{po.po_number}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Reference Number</Text>
            <Text style={styles.value}>{po.reference_number || '-'}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>{statusLabels[po.status]}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Priority</Text>
            <Text style={styles.value}>{priorityLabels[po.priority]}</Text>
          </View>
        </View>
      </View>

      {/* Dates */}
      <View style={styles.section}>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Order Date</Text>
            <Text style={styles.value}>{formatDate(po.order_date)}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Expected Delivery</Text>
            <Text style={styles.value}>{formatDate(po.expected_delivery_date)}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Payment Terms</Text>
            <Text style={styles.value}>{po.payment_terms} days</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Currency</Text>
            <Text style={styles.value}>{po.currency}</Text>
          </View>
        </View>
      </View>

      {/* Vendor Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vendor Information</Text>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Vendor Name</Text>
            <Text style={styles.value}>{po.vendor_name}</Text>
          </View>
        </View>
      </View>

      {/* Delivery Information */}
      {po.delivery_address && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Delivery Address</Text>
              <Text style={styles.value}>{po.delivery_address}</Text>
            </View>
          </View>
          {po.delivery_notes && (
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Delivery Notes</Text>
                <Text style={styles.value}>{po.delivery_notes}</Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Line Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Line Items</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.tableCol1}>#</Text>
            <Text style={styles.tableCol2}>Item Code</Text>
            <Text style={styles.tableCol3}>Item Name</Text>
            <Text style={styles.tableCol4}>Unit</Text>
            <Text style={styles.tableCol5}>Qty</Text>
            <Text style={styles.tableCol6}>Unit Price</Text>
            <Text style={styles.tableCol7}>Disc %</Text>
            <Text style={styles.tableCol8}>Total</Text>
          </View>

          {/* Table Rows */}
          {items.map((item, index) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.tableCol1}>{item.line_number}</Text>
              <Text style={styles.tableCol2}>{item.item_code || '-'}</Text>
              <Text style={styles.tableCol3}>{item.item_name}</Text>
              <Text style={styles.tableCol4}>{item.unit}</Text>
              <Text style={styles.tableCol5}>{item.quantity}</Text>
              <Text style={styles.tableCol6}>{formatCurrency(item.unit_price)}</Text>
              <Text style={styles.tableCol7}>{item.discount_percent}%</Text>
              <Text style={styles.tableCol8}>{formatCurrency(item.total_price)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Financial Summary */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {/* QR Code on the left */}
            {qrCodeUrl && (
              <View style={styles.qrContainer}>
                <Image src={qrCodeUrl} style={styles.qrCode} />
                <Text style={styles.qrText}>Scan to verify</Text>
              </View>
            )}

            {/* Totals on the right */}
            <View style={{ flex: 1 }}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal:</Text>
                <Text style={styles.totalValue}>{formatCurrency(po.subtotal)}</Text>
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount ({po.discount_percent}%):</Text>
                <Text style={styles.totalValue}>- {formatCurrency(po.discount_amount)}</Text>
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax ({po.tax_percent}%):</Text>
                <Text style={styles.totalValue}>{formatCurrency(po.tax_amount)}</Text>
              </View>

              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>TOTAL AMOUNT:</Text>
                <Text style={styles.grandTotalValue}>{formatCurrency(po.total_amount)}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Terms & Conditions */}
      {po.terms_conditions && (
        <View style={styles.notes}>
          <Text style={styles.notesTitle}>Terms & Conditions</Text>
          <Text style={styles.notesText}>{po.terms_conditions}</Text>
        </View>
      )}

      {/* Footer Note */}
      <View style={{ marginTop: 30, fontSize: 8, color: '#999', textAlign: 'center' }}>
        <Text>This is a computer-generated document. No signature is required.</Text>
        <Text>Generated on {new Date().toLocaleDateString('id-ID')}</Text>
      </View>
    </Page>
  </Document>
  )
}
