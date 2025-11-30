"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"

import { PDFDocument, rgb } from "pdf-lib"
import fontkit from "@pdf-lib/fontkit"

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icon } from "@/components/ui/icon"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export default function SignPdfPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null)
  const [fileName, setFileName] = useState("")
  const [signMode, setSignMode] = useState<"myself" | "others" | "stamp">("myself")
  const [signatureType, setSignatureType] = useState<"draw" | "type" | "upload">("draw")
  const [signatureImage, setSignatureImage] = useState<string | null>(null)
  const [uploadedSignature, setUploadedSignature] = useState<string | null>(null)
  const [typedSignature, setTypedSignature] = useState("")
  const [isDrawing, setIsDrawing] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [signaturePosition, setSignaturePosition] = useState({ x: 50, y: 50 })
  const [signaturePage, setSignaturePage] = useState(1)
  const [pageCount, setPageCount] = useState(0)
  const [pdfThumbnail, setPdfThumbnail] = useState<string>("")
  const [pdfPreviewDimensions, setPdfPreviewDimensions] = useState({ width: 0, height: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    import('pdfjs-dist').then((pdfjsLib) => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.min.mjs'
    })
  }, [])

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.strokeStyle = "#000000"
        ctx.lineWidth = 2
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctxRef.current = ctx
      }
    }
  }, [])

  const generateThumbnail = async (arrayBuffer: ArrayBuffer, pageNum: number = 1) => {
    try {
      const pdfjsLib = await import('pdfjs-dist')
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale: 1.5 })
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")

      canvas.width = viewport.width
      canvas.height = viewport.height

      if (context) {
        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise

        setPdfThumbnail(canvas.toDataURL())
        setPdfPreviewDimensions({ width: viewport.width, height: viewport.height })
      }
    } catch (error) {
      console.error("Error generating thumbnail:", error)
    }
  }

  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!previewRef.current) return

    // Get the image element to get its actual displayed dimensions
    const imgElement = previewRef.current.querySelector('img')
    if (!imgElement) return

    const rect = imgElement.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    // Calculate percentage based on the displayed image size
    const x = (clickX / rect.width) * 100
    const y = (clickY / rect.height) * 100

    setSignaturePosition({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setPdfFile(file)
      setFileName(file.name)

      // Read file for page count
      const arrayBuffer1 = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer1)
      setPageCount(pdfDoc.getPageCount())

      // Read file again for storage (fresh ArrayBuffer)
      const arrayBuffer2 = await file.arrayBuffer()
      setPdfBytes(arrayBuffer2)

      // Read file again for thumbnail (fresh ArrayBuffer)
      const arrayBuffer3 = await file.arrayBuffer()
      generateThumbnail(arrayBuffer3, 1)
    }
  }

  useEffect(() => {
    if (pdfFile && signaturePage) {
      // Read file fresh to avoid detachment issues
      pdfFile.arrayBuffer().then(arrayBuffer => {
        generateThumbnail(arrayBuffer, signaturePage)
      })
    }
  }, [signaturePage, pdfFile])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!ctxRef.current || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    ctxRef.current.beginPath()
    ctxRef.current.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctxRef.current || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    ctxRef.current.lineTo(x, y)
    ctxRef.current.stroke()
  }

  const stopDrawing = () => {
    if (ctxRef.current) {
      ctxRef.current.closePath()
    }
    setIsDrawing(false)
    if (canvasRef.current) {
      setSignatureImage(canvasRef.current.toDataURL("image/png"))
    }
  }

  const clearSignature = () => {
    if (canvasRef.current && ctxRef.current) {
      ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      setSignatureImage(null)
    }
    setTypedSignature("")
    setUploadedSignature(null)
  }

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && (file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/jpg")) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedSignature(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSign = async () => {
    if (!pdfFile) return

    // Validation based on sign mode and signature type
    if (signMode === "myself") {
      if (signatureType === "draw" && !signatureImage) return
      if (signatureType === "type" && !typedSignature) return
    } else if (signMode === "others") {
      if (!uploadedSignature) return
    } else if (signMode === "stamp") {
      // Future feature - stamp not implemented yet
      alert("Stamp feature coming soon!")
      return
    }

    setIsProcessing(true)
    try {
      // Read file fresh to avoid detachment issues
      const arrayBuffer = await pdfFile.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      pdfDoc.registerFontkit(fontkit)

      const pages = pdfDoc.getPages()
      const page = pages[signaturePage - 1]
      const { width, height } = page.getSize()

      let imageToEmbed: string | null = null

      // Determine which signature to use based on mode
      if (signMode === "myself") {
        if (signatureType === "draw") {
          imageToEmbed = signatureImage
        } else if (signatureType === "type" && typedSignature) {
          // Draw text signature for "myself" mode
          const font = await pdfDoc.embedFont("Helvetica")
          const fontSize = 24
          const textWidth = font.widthOfTextAtSize(typedSignature, fontSize)
          const textHeight = fontSize

          // Calculate position accounting for centering
          const centerX = (signaturePosition.x / 100) * width
          const centerY = height - (signaturePosition.y / 100) * height

          page.drawText(typedSignature, {
            x: centerX - textWidth / 2,
            y: centerY - textHeight / 2,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
          })
        }
      } else if (signMode === "others") {
        imageToEmbed = uploadedSignature
      }

      // Embed image if we have one (drawn signature or uploaded signature)
      if (imageToEmbed) {
        const pngImageBytes = await fetch(imageToEmbed).then((res) =>
          res.arrayBuffer()
        )
        const pngImage = await pdfDoc.embedPng(pngImageBytes)
        const pngDims = pngImage.scale(0.3)

        // Calculate position accounting for centering (the red box is centered on the click point)
        const centerX = (signaturePosition.x / 100) * width
        const centerY = height - (signaturePosition.y / 100) * height

        page.drawImage(pngImage, {
          x: centerX - pngDims.width / 2,
          y: centerY - pngDims.height / 2,
          width: pngDims.width,
          height: pngDims.height,
        })
      }

      const signedPdfBytes = await pdfDoc.save()

      // Download
      const blob = new Blob([new Uint8Array(signedPdfBytes)], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      const baseName = fileName.replace(".pdf", "")
      link.href = url
      link.download = `${baseName}-signed.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error signing PDF:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setPdfFile(null)
    setPdfBytes(null)
    setFileName("")
    setSignatureImage(null)
    setTypedSignature("")
    setSignaturePosition({ x: 50, y: 50 })
    setSignaturePage(1)
    setPageCount(0)
    setPdfThumbnail("")
    clearSignature()
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
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/tools">Tools</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Sign PDF</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sign PDF</h1>
            <p className="text-muted-foreground">
              Add your signature to PDF documents.
            </p>
          </div>

          {!pdfFile ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 bg-muted/30">
              <Icon name="Upload" size={48} className="text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Drag and drop a PDF file or click to browse
              </p>
              <Input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="max-w-xs"
              />
            </div>
          ) : (
            <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Controls */}
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="FileText" size={20} className="text-muted-foreground" />
                    <span className="font-medium truncate">{fileName}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {pageCount} pages
                  </p>
                </div>

                <div>
                  <Label>Sign Mode</Label>
                  <Tabs value={signMode} onValueChange={(v) => setSignMode(v as "myself" | "others" | "stamp")} className="mt-1">
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger value="myself">Myself</TabsTrigger>
                      <TabsTrigger value="others">Others</TabsTrigger>
                      <TabsTrigger value="stamp">Stamp</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <p className="text-xs text-muted-foreground mt-1">
                    {signMode === "myself" && "Use your signature from profile or draw/type"}
                    {signMode === "others" && "Upload signature image for others to sign"}
                    {signMode === "stamp" && "Coming soon - Use company stamp"}
                  </p>
                </div>

                <div>
                  <Label>Signature Page</Label>
                  <Input
                    type="number"
                    min={1}
                    max={pageCount}
                    value={signaturePage}
                    onChange={(e) => setSignaturePage(Number(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Preview updates when you change page
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Position X (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={signaturePosition.x}
                      onChange={(e) =>
                        setSignaturePosition((prev) => ({
                          ...prev,
                          x: Number(e.target.value),
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Position Y (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={signaturePosition.y}
                      onChange={(e) =>
                        setSignaturePosition((prev) => ({
                          ...prev,
                          y: Number(e.target.value),
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Click on the PDF preview to set signature position
                </p>

                <Button
                  onClick={handleSign}
                  className="w-full bg-[#005357] hover:bg-[#004145]"
                  disabled={
                    isProcessing ||
                    (signatureType === "draw" && !signatureImage) ||
                    (signatureType === "type" && !typedSignature)
                  }
                >
                  <Icon name="PenLine" size={16} className="mr-2" />
                  {isProcessing ? "Processing..." : "Sign & Download"}
                </Button>

                <Button variant="outline" onClick={handleReset} className="w-full">
                  <Icon name="RotateCcw" size={16} className="mr-2" />
                  Reset
                </Button>
              </div>

              {/* PDF Preview */}
              <div className="lg:col-span-2 space-y-4">
                <div className="border rounded-lg p-4 bg-muted/30">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Icon name="FileText" size={20} />
                    PDF Preview - Page {signaturePage}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click anywhere on the PDF to place your signature
                  </p>
                  {pdfThumbnail && (
                    <div className="relative rounded-lg border overflow-hidden bg-white">
                      <div
                        ref={previewRef}
                        className="relative cursor-crosshair"
                        onClick={handlePreviewClick}
                      >
                        <img
                          src={pdfThumbnail}
                          alt="PDF Preview"
                          className="w-full h-auto"
                        />
                        {/* Signature position indicator */}
                        <div
                          className="absolute w-24 h-12 border-2 border-red-500 bg-red-500/20 rounded flex items-center justify-center text-xs font-medium text-red-700 pointer-events-none"
                          style={{
                            left: `${signaturePosition.x}%`,
                            top: `${signaturePosition.y}%`,
                            transform: 'translate(-50%, -50%)',
                          }}
                        >
                          Signature
                        </div>
                      </div>
                      <div className="p-2 bg-muted/50 text-xs text-center text-muted-foreground">
                        Signature will be placed at: X: {signaturePosition.x}%, Y: {signaturePosition.y}%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Signature Drawing Area */}
            <div className="mt-6">
              {signMode === "myself" ? (
                <Tabs
                  value={signatureType}
                  onValueChange={(v) => setSignatureType(v as "draw" | "type")}
                >
                  <TabsList className="mb-4">
                    <TabsTrigger value="draw">
                      <Icon name="PenLine" size={16} className="mr-2" />
                      Draw Signature
                    </TabsTrigger>
                    <TabsTrigger value="type">
                      <Icon name="Type" size={16} className="mr-2" />
                      Type Signature
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="draw" className="space-y-4">
                    <div className="border rounded-lg p-4 bg-white">
                      <p className="text-sm text-muted-foreground mb-2">
                        Draw your signature below
                      </p>
                      <canvas
                        ref={canvasRef}
                        width={500}
                        height={200}
                        className="border rounded cursor-crosshair bg-white w-full"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSignature}
                        className="mt-2"
                      >
                        <Icon name="Trash2" size={16} className="mr-2" />
                        Clear
                      </Button>
                    </div>

                    {signatureImage && (
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">
                          Signature Preview
                        </p>
                        <img
                          src={signatureImage}
                          alt="Signature"
                          className="max-h-24 border rounded bg-white"
                        />
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="type" className="space-y-4">
                    <div>
                      <Label>Type your signature</Label>
                      <Input
                        value={typedSignature}
                        onChange={(e) => setTypedSignature(e.target.value)}
                        placeholder="John Doe"
                        className="mt-1 text-2xl h-16 font-serif"
                        style={{ fontFamily: "cursive, serif" }}
                      />
                    </div>

                    {typedSignature && (
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">
                          Signature Preview
                        </p>
                        <p
                          className="text-3xl"
                          style={{ fontFamily: "cursive, serif" }}
                        >
                          {typedSignature}
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              ) : signMode === "others" ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Upload Signature</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload a signature image file (PNG or JPG) for someone else to sign the document
                  </p>
                  <div className="border rounded-lg p-4 bg-white">
                    <Input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleSignatureUpload}
                      className="mb-4"
                    />
                    {uploadedSignature && (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">Signature Preview</p>
                        <div className="border rounded-lg p-4 bg-muted/30 flex items-center justify-center">
                          <img
                            src={uploadedSignature}
                            alt="Uploaded Signature"
                            className="max-h-32 object-contain"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUploadedSignature(null)}
                          className="mt-2"
                        >
                          <Icon name="Trash2" size={16} className="mr-2" />
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-8 bg-muted/30 text-center">
                  <p className="text-muted-foreground">
                    Stamp feature coming soon...
                  </p>
                </div>
              )}
            </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
