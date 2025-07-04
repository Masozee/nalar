"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  BookUser,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  Command,
  FileText,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  QrCode,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Web CSIS",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Knowledge Hub",
      logo: AudioWaveform,
      plan: "Startup",
    },
   
  ],
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Traffic",
          url: "/admin/dashboard",
        },
        {
          title: "Logs",
          url: "/admin/activity-log",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Publications",
      url: "#",
      icon: FileText,
      items: [
        {
          title: "List",
          url: "/admin/publications",
        },
        {
          title: "Category",
          url: "/admin/publications/category",
        },
        {
          title: "Tags",
          url: "#",
        },
      ],
    },
    {
      title: "Events",
      url: "/admin/events",
      icon: CalendarDays,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Shorten URL",
      url: "#",
      icon: QrCode,
    },
    {
      name: "Career",
      url: "#",
      icon: BriefcaseBusiness,
    },
    {
      name: "Contacts",
      url: "#",
      icon: BookUser,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
