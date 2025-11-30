"use client"

import * as React from "react"
import { useState, useEffect } from "react"

import { PDFDocument, rgb, degrees } from "pdf-lib"

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
import { Slider } from "@/components/ui/slider"
import { Icon } from "@/components/ui/icon"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function WatermarkPdfPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null)
  const [fileName, setFileName] = useState("")
  const [pageCount, setPageCount] = useState(0)
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL")
  const [fontSize, setFontSize] = useState(50)
  const [opacity, setOpacity] = useState(30)
  const [rotation, setRotation] = useState(-45)
  const [position, setPosition] = useState("center")
  const [color, setColor] = useState("#888888")
  const [isProcessing, setIsProcessing] = useState(false)
  const [pdfThumbnail, setPdfThumbnail] = useState<string>("")

  useEffect(() => {
    import('pdfjs-dist').then((pdfjsLib) => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.min.mjs'
    })
  }, [])

  const generateThumbnail = async (arrayBuffer: ArrayBuffer) => {
    try {
      const pdfjsLib = await import('pdfjs-dist')
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const page = await pdf.getPage(1)
      const viewport = page.getViewport({ scale: 0.5 })
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
      }
    } catch (error) {
      console.error("Error generating thumbnail:", error)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setPdfFile(file)
      setFileName(file.name)

      const arrayBuffer = await file.arrayBuffer()
      setPdfBytes(arrayBuffer)

      const pdfDoc = await PDFDocument.load(arrayBuffer)
      setPageCount(pdfDoc.getPageCount())

      generateThumbnail(arrayBuffer)
    }
  }

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16) / 255,
          g: parseInt(result[2], 16) / 255,
          b: parseInt(result[3], 16) / 255,
        }
      : { r: 0.5, g: 0.5, b: 0.5 }
  }

  const handleAddWatermark = async () => {
    if (!pdfBytes || !watermarkText) return

    setIsProcessing(true)
    try {
      const pdfDoc = await PDFDocument.load(pdfBytes)
      const pages = pdfDoc.getPages()
      const font = await pdfDoc.embedFont("Helvetica-Bold")
      const rgbColor = hexToRgb(color)

      for (const page of pages) {
        const { width, height } = page.getSize()
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize)
        const textHeight = fontSize

        let x: number
        let y: number

        switch (position) {
          case "top-left":
            x = 50
            y = height - 50 - textHeight
            break
          case "top-right":
            x = width - textWidth - 50
            y = height - 50 - textHeight
            break
          case "bottom-left":
            x = 50
            y = 50
            break
          case "bottom-right":
            x = width - textWidth - 50
            y = 50
            break
          case "center":
          default:
            x = (width - textWidth) / 2
            y = (height - textHeight) / 2
            break
        }

        page.drawText(watermarkText, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
          opacity: opacity / 100,
          rotate: degrees(rotation),
        })
      }

      const watermarkedPdfBytes = await pdfDoc.save()

      // Download
      const blob = new Blob([new Uint8Array(watermarkedPdfBytes)], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      const baseName = fileName.replace(".pdf", "")
      link.href = url
      link.download = `${baseName}-watermarked.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error adding watermark:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setPdfFile(null)
    setPdfBytes(null)
    setFileName("")
    setPageCount(0)
    setWatermarkText("CONFIDENTIAL")
    setFontSize(50)
    setOpacity(30)
    setRotation(-45)
    setPosition("center")
    setColor("#888888")
    setPdfThumbnail("")
  }

  const presetTexts = ["CONFIDENTIAL", "DRAFT", "COPY", "SAMPLE", "DO NOT COPY"]

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
                  <BreadcrumbPage>Watermark PDF</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Watermark PDF</h1>
            <p className="text-muted-foreground">
              Add text watermark to all pages of a PDF document.
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
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Controls */}
              <div className="lg:col-span-2 space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="FileText" size={20} className="text-muted-foreground" />
                    <span className="font-medium truncate">{fileName}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {pageCount} pages - watermark will be added to all pages
                  </p>
                </div>

                {pdfThumbnail && (
                  <div className="rounded-lg border overflow-hidden">
                    <img
                      src={pdfThumbnail}
                      alt="PDF Preview"
                      className="w-full h-auto"
                    />
                    <p className="text-xs text-center text-muted-foreground p-2 bg-muted/50">
                      Page 1 Preview
                    </p>
                  </div>
                )}

                <div>
                  <Label>Watermark Text</Label>
                  <Input
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="Enter watermark text"
                    className="mt-1"
                  />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {presetTexts.map((text) => (
                      <Button
                        key={text}
                        variant="outline"
                        size="sm"
                        onClick={() => setWatermarkText(text)}
                        className={watermarkText === text ? "bg-muted" : ""}
                      >
                        {text}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Position</Label>
                  <Select value={position} onValueChange={setPosition}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="top-left">Top Left</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex justify-between">
                    <Label>Font Size</Label>
                    <span className="text-sm text-muted-foreground">{fontSize}px</span>
                  </div>
                  <Slider
                    value={[fontSize]}
                    onValueChange={([value]) => setFontSize(value)}
                    min={20}
                    max={150}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between">
                    <Label>Opacity</Label>
                    <span className="text-sm text-muted-foreground">{opacity}%</span>
                  </div>
                  <Slider
                    value={[opacity]}
                    onValueChange={([value]) => setOpacity(value)}
                    min={5}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between">
                    <Label>Rotation</Label>
                    <span className="text-sm text-muted-foreground">{rotation}°</span>
                  </div>
                  <Slider
                    value={[rotation]}
                    onValueChange={([value]) => setRotation(value)}
                    min={-90}
                    max={90}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-12 h-9 p-1"
                    />
                    <Input
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAddWatermark}
                  className="w-full bg-[#005357] hover:bg-[#004145]"
                  disabled={isProcessing || !watermarkText}
                >
                  <Icon name="Stamp" size={16} className="mr-2" />
                  {isProcessing ? "Processing..." : "Add Watermark & Download"}
                </Button>

                <Button variant="outline" onClick={handleReset} className="w-full">
                  <Icon name="RotateCcw" size={16} className="mr-2" />
                  Reset
                </Button>
              </div>

              {/* Preview */}
              <div className="lg:col-span-2">
                <p className="text-sm text-muted-foreground mb-2">Preview</p>
                <div
                  className="border rounded-lg bg-white aspect-[3/4] flex items-center justify-center relative overflow-hidden"
                  style={{ minHeight: "400px" }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-muted-foreground/20 text-sm">
                      PDF Page Preview
                    </div>
                  </div>
                  <div
                    className="absolute font-bold whitespace-nowrap"
                    style={{
                      fontSize: `${fontSize * 0.5}px`,
                      color: color,
                      opacity: opacity / 100,
                      transform: `rotate(${rotation}deg)`,
                    }}
                  >
                    {watermarkText}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
