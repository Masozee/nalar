"use client"

import * as React from "react"
import { useState, useRef, useCallback } from "react"
import { Icon } from "@/components/ui/icon"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type CropArea = {
  x: number
  y: number
  width: number
  height: number
}

const aspectRatios = [
  { label: "Free", value: "free" },
  { label: "1:1 (Square)", value: "1:1" },
  { label: "4:3", value: "4:3" },
  { label: "16:9", value: "16:9" },
  { label: "3:2", value: "3:2" },
  { label: "2:3 (Portrait)", value: "2:3" },
  { label: "9:16 (Story)", value: "9:16" },
]

export default function CropImagePage() {
  const [image, setImage] = useState<string | null>(null)
  const [fileName, setFileName] = useState("")
  const [cropArea, setCropArea] = useState<CropArea>({ x: 50, y: 50, width: 200, height: 200 })
  const [aspectRatio, setAspectRatio] = useState("free")
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          setImageSize({ width: img.width, height: img.height })
          // Set initial crop area to center of image
          const cropW = Math.min(img.width * 0.6, 400)
          const cropH = Math.min(img.height * 0.6, 400)
          setCropArea({
            x: (img.width - cropW) / 2,
            y: (img.height - cropH) / 2,
            width: cropW,
            height: cropH,
          })
        }
        img.src = event.target?.result as string
        setImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAspectRatioChange = (value: string) => {
    setAspectRatio(value)
    if (value !== "free" && imageSize.width > 0) {
      const [w, h] = value.split(":").map(Number)
      const ratio = w / h
      let newWidth = cropArea.width
      let newHeight = newWidth / ratio
      if (newHeight > imageSize.height) {
        newHeight = imageSize.height * 0.8
        newWidth = newHeight * ratio
      }
      setCropArea((prev) => ({
        ...prev,
        width: newWidth,
        height: newHeight,
      }))
    }
  }

  const handleMouseDown = (e: React.MouseEvent, type: "drag" | "resize") => {
    e.preventDefault()
    if (type === "drag") {
      setIsDragging(true)
    } else {
      setIsResizing(true)
    }
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return
      const container = containerRef.current.getBoundingClientRect()
      const scale = container.width / imageSize.width

      if (isDragging) {
        const dx = (e.clientX - dragStart.x) / scale
        const dy = (e.clientY - dragStart.y) / scale
        setCropArea((prev) => ({
          ...prev,
          x: Math.max(0, Math.min(imageSize.width - prev.width, prev.x + dx)),
          y: Math.max(0, Math.min(imageSize.height - prev.height, prev.y + dy)),
        }))
        setDragStart({ x: e.clientX, y: e.clientY })
      } else if (isResizing) {
        const dx = (e.clientX - dragStart.x) / scale
        const dy = (e.clientY - dragStart.y) / scale

        if (aspectRatio === "free") {
          setCropArea((prev) => ({
            ...prev,
            width: Math.max(50, Math.min(imageSize.width - prev.x, prev.width + dx)),
            height: Math.max(50, Math.min(imageSize.height - prev.y, prev.height + dy)),
          }))
        } else {
          const [w, h] = aspectRatio.split(":").map(Number)
          const ratio = w / h
          const newWidth = Math.max(50, Math.min(imageSize.width - cropArea.x, cropArea.width + dx))
          const newHeight = newWidth / ratio
          if (cropArea.y + newHeight <= imageSize.height) {
            setCropArea((prev) => ({
              ...prev,
              width: newWidth,
              height: newHeight,
            }))
          }
        }
        setDragStart({ x: e.clientX, y: e.clientY })
      }
    },
    [isDragging, isResizing, dragStart, imageSize, aspectRatio, cropArea]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(false)
  }, [])

  React.useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp])

  const handleCrop = () => {
    if (!image || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = cropArea.width
      canvas.height = cropArea.height
      ctx.drawImage(
        img,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        cropArea.width,
        cropArea.height
      )

      // Download
      const link = document.createElement("a")
      link.download = `cropped-${fileName || "image.png"}`
      link.href = canvas.toDataURL("image/png")
      link.click()
    }
    img.src = image
  }

  const handleReset = () => {
    setImage(null)
    setFileName("")
    setCropArea({ x: 50, y: 50, width: 200, height: 200 })
    setAspectRatio("free")
  }

  const scale = containerRef.current && imageSize.width > 0
    ? Math.min(1, (containerRef.current.clientWidth || 600) / imageSize.width)
    : 1

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
                  <BreadcrumbPage>Crop Image</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Crop Image</h1>
            <p className="text-muted-foreground">
              Select an area to crop from your image.
            </p>
          </div>

          {!image ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 bg-muted/30">
              <Icon name="Upload" size={48} className="text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Drag and drop an image or click to browse
              </p>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="max-w-xs"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Controls */}
              <div className="space-y-4">
                <div>
                  <Label>Aspect Ratio</Label>
                  <Select value={aspectRatio} onValueChange={handleAspectRatioChange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aspectRatios.map((ratio) => (
                        <SelectItem key={ratio.value} value={ratio.value}>
                          {ratio.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Width</Label>
                    <Input
                      type="number"
                      value={Math.round(cropArea.width)}
                      onChange={(e) =>
                        setCropArea((prev) => ({ ...prev, width: Number(e.target.value) }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Height</Label>
                    <Input
                      type="number"
                      value={Math.round(cropArea.height)}
                      onChange={(e) =>
                        setCropArea((prev) => ({ ...prev, height: Number(e.target.value) }))
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCrop} className="flex-1 bg-[#005357] hover:bg-[#004145]">
                    <Icon name="Crop" size={16} className="mr-2" />
                    Crop & Download
                  </Button>
                </div>

                <Button variant="outline" onClick={handleReset} className="w-full">
                  <Icon name="RotateCcw" size={16} className="mr-2" />
                  Reset
                </Button>
              </div>

              {/* Image Preview with Crop Area */}
              <div className="lg:col-span-3">
                <div
                  ref={containerRef}
                  className="relative border rounded-lg overflow-hidden bg-[#1a1a1a] inline-block"
                  style={{ maxWidth: "100%" }}
                >
                  <img
                    ref={imageRef}
                    src={image}
                    alt="Preview"
                    style={{
                      display: "block",
                      maxWidth: "100%",
                      height: "auto",
                    }}
                    draggable={false}
                  />

                  {/* Overlay */}
                  <div
                    className="absolute inset-0 bg-black/50"
                    style={{
                      clipPath: `polygon(
                        0% 0%,
                        0% 100%,
                        ${(cropArea.x / imageSize.width) * 100}% 100%,
                        ${(cropArea.x / imageSize.width) * 100}% ${(cropArea.y / imageSize.height) * 100}%,
                        ${((cropArea.x + cropArea.width) / imageSize.width) * 100}% ${(cropArea.y / imageSize.height) * 100}%,
                        ${((cropArea.x + cropArea.width) / imageSize.width) * 100}% ${((cropArea.y + cropArea.height) / imageSize.height) * 100}%,
                        ${(cropArea.x / imageSize.width) * 100}% ${((cropArea.y + cropArea.height) / imageSize.height) * 100}%,
                        ${(cropArea.x / imageSize.width) * 100}% 100%,
                        100% 100%,
                        100% 0%
                      )`,
                    }}
                  />

                  {/* Crop Box */}
                  <div
                    className="absolute border-2 border-white cursor-move"
                    style={{
                      left: `${(cropArea.x / imageSize.width) * 100}%`,
                      top: `${(cropArea.y / imageSize.height) * 100}%`,
                      width: `${(cropArea.width / imageSize.width) * 100}%`,
                      height: `${(cropArea.height / imageSize.height) * 100}%`,
                    }}
                    onMouseDown={(e) => handleMouseDown(e, "drag")}
                  >
                    {/* Grid lines */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                      {[...Array(9)].map((_, i) => (
                        <div key={i} className="border border-white/30" />
                      ))}
                    </div>

                    {/* Resize handle */}
                    <div
                      className="absolute -bottom-2 -right-2 w-4 h-4 bg-white rounded-full cursor-se-resize"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        handleMouseDown(e, "resize")
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </SidebarInset>
    </SidebarProvider>
  )
}
