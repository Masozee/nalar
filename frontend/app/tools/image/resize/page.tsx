"use client"

import * as React from "react"
import { useState, useRef } from "react"

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const presets = [
  { label: "Custom", width: 0, height: 0 },
  { label: "HD (1280x720)", width: 1280, height: 720 },
  { label: "Full HD (1920x1080)", width: 1920, height: 1080 },
  { label: "2K (2560x1440)", width: 2560, height: 1440 },
  { label: "4K (3840x2160)", width: 3840, height: 2160 },
  { label: "Instagram Post (1080x1080)", width: 1080, height: 1080 },
  { label: "Instagram Story (1080x1920)", width: 1080, height: 1920 },
  { label: "Twitter Post (1200x675)", width: 1200, height: 675 },
  { label: "Facebook Cover (820x312)", width: 820, height: 312 },
  { label: "LinkedIn Banner (1584x396)", width: 1584, height: 396 },
]

export default function ResizeImagePage() {
  const [image, setImage] = useState<string | null>(null)
  const [fileName, setFileName] = useState("")
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 })
  const [newSize, setNewSize] = useState({ width: 0, height: 0 })
  const [maintainAspect, setMaintainAspect] = useState(true)
  const [preset, setPreset] = useState("Custom")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          setOriginalSize({ width: img.width, height: img.height })
          setNewSize({ width: img.width, height: img.height })
        }
        img.src = event.target?.result as string
        setImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleWidthChange = (value: number) => {
    if (maintainAspect && originalSize.width > 0) {
      const ratio = originalSize.height / originalSize.width
      setNewSize({ width: value, height: Math.round(value * ratio) })
    } else {
      setNewSize((prev) => ({ ...prev, width: value }))
    }
    setPreset("Custom")
  }

  const handleHeightChange = (value: number) => {
    if (maintainAspect && originalSize.height > 0) {
      const ratio = originalSize.width / originalSize.height
      setNewSize({ width: Math.round(value * ratio), height: value })
    } else {
      setNewSize((prev) => ({ ...prev, height: value }))
    }
    setPreset("Custom")
  }

  const handlePresetChange = (value: string) => {
    setPreset(value)
    const selected = presets.find((p) => p.label === value)
    if (selected && selected.width > 0) {
      setNewSize({ width: selected.width, height: selected.height })
      setMaintainAspect(false)
    }
  }

  const handlePercentage = (percent: number) => {
    const width = Math.round(originalSize.width * (percent / 100))
    const height = Math.round(originalSize.height * (percent / 100))
    setNewSize({ width, height })
    setPreset("Custom")
  }

  const handleResize = () => {
    if (!image || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = newSize.width
      canvas.height = newSize.height
      ctx.drawImage(img, 0, 0, newSize.width, newSize.height)

      const link = document.createElement("a")
      const ext = fileName.split(".").pop()?.toLowerCase() || "png"
      link.download = `resized-${fileName || "image.png"}`
      link.href = canvas.toDataURL(`image/${ext === "jpg" ? "jpeg" : ext}`)
      link.click()
    }
    img.src = image
  }

  const handleReset = () => {
    setImage(null)
    setFileName("")
    setOriginalSize({ width: 0, height: 0 })
    setNewSize({ width: 0, height: 0 })
    setPreset("Custom")
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
                  <BreadcrumbPage>Resize Image</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Resize Image</h1>
            <p className="text-muted-foreground">
              Change the dimensions of your image.
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
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p className="text-muted-foreground">Original Size</p>
                  <p className="font-medium">
                    {originalSize.width} x {originalSize.height} px
                  </p>
                </div>

                <div>
                  <Label>Preset Sizes</Label>
                  <Select value={preset} onValueChange={handlePresetChange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {presets.map((p) => (
                        <SelectItem key={p.label} value={p.label}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePercentage(25)}
                  >
                    25%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePercentage(50)}
                  >
                    50%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePercentage(75)}
                  >
                    75%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePercentage(100)}
                  >
                    100%
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={maintainAspect ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMaintainAspect(!maintainAspect)}
                    className={maintainAspect ? "bg-[#005357] hover:bg-[#004145]" : ""}
                  >
                    {maintainAspect ? (
                      <Icon name="Link2" size={16} className="mr-2" />
                    ) : (
                      <Icon name="Link2Off" size={16} className="mr-2" />
                    )}
                    {maintainAspect ? "Aspect Locked" : "Aspect Free"}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Width (px)</Label>
                    <Input
                      type="number"
                      value={newSize.width}
                      onChange={(e) => handleWidthChange(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Height (px)</Label>
                    <Input
                      type="number"
                      value={newSize.height}
                      onChange={(e) => handleHeightChange(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p className="text-muted-foreground">New Size</p>
                  <p className="font-medium">
                    {newSize.width} x {newSize.height} px
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {originalSize.width > 0 &&
                      `${Math.round((newSize.width / originalSize.width) * 100)}% of original`}
                  </p>
                </div>

                <Button
                  onClick={handleResize}
                  className="w-full bg-[#005357] hover:bg-[#004145]"
                >
                  <Icon name="Download" size={16} className="mr-2" />
                  Resize & Download
                </Button>

                <Button variant="outline" onClick={handleReset} className="w-full">
                  <Icon name="RotateCcw" size={16} className="mr-2" />
                  Reset
                </Button>
              </div>

              {/* Image Preview */}
              <div className="lg:col-span-3">
                <div className="border rounded-lg overflow-hidden bg-[#1a1a1a] p-4">
                  <img
                    src={image}
                    alt="Preview"
                    className="max-w-full h-auto mx-auto"
                    style={{ maxHeight: "500px" }}
                  />
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
