"use client"

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";

import { BookOpen, Bot, Frame, LifeBuoy, Map, PieChart, Send, Settings2, Box } from "lucide-react"
import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

const data = {
  navMain: {
    title : "Guests",
    items : [
      {
        title: "Products",
        url: "/products",
        icon: Box,
        isActive: true,
        items: [
          {
            title: "Vehicles",
            url: "/products?categories=Vehicles",
          },
          {
            title: "Technologies",
            url: "/products?categories=Technologies",
          },
        ],
      },
      {
        title: "Models",
        url: "#",
        icon: Bot,
        items: [
          {
            title: "Genesis",
            url: "#",
          },
          {
            title: "Explorer",
            url: "#",
          },
          {
            title: "Quantum",
            url: "#",
          },
        ],
      },
      {
        title: "Documentation",
        url: "#",
        icon: BookOpen,
        items: [
          {
            title: "Introduction",
            url: "#",
          },
          {
            title: "Get Started",
            url: "#",
          },
          {
            title: "Tutorials",
            url: "#",
          },
          {
            title: "Changelog",
            url: "#",
          },
        ],
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
  },
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({...props}) {
  // Local state for the user object
  const [user, setUser] = useState(null);

  // Fetch the user info on mount
  useEffect(() => {
    // Get the token from cookies
    const token = Cookies.get("token");
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/users/infos`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch user info");
          return response.json();
        })
        .then((data) => {
          // Construct the user object with fetched data
          setUser({
            name: data.username,
            avatar: "favicon.ico",
            admin: data.admin,
          });
        })
        .catch((err) => {
          console.error("Error fetching user info:", err);
          setUser(null);
        });
    }
  }, []);

  return (
    (<Sidebar
      className="top-[--header-height] !h-[calc(100svh-var(--header-height))]"
      {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <img src="favicon.ico" alt="SpaceX" className="w-6 h-6" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">SpaceY</span>
                  <span className="truncate text-xs">Exploration company</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain object={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>)
  );
}
