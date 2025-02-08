"use client"

import React from "react"
import { usePathname } from 'next/navigation'
import { SidebarIcon } from "lucide-react"
import { SearchForm } from "@/components/search-form"
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
import { useSidebar } from "@/components/ui/sidebar"
import { Rocket, Satellite } from "lucide-react"

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()
  const pathname = usePathname()

  // Split the current path into segments, ignoring empty segments.
  const pathSegments = pathname.split('/').filter(Boolean)

  // Map each segment to an object containing the href and a title.
  const breadcrumbs = pathSegments.map((segment, index) => {
    // Build the href for this segment by joining all preceding segments.
    const href = "/" + pathSegments.slice(0, index + 1).join("/")
    // Capitalize the segment to use as a title.
    const title = segment.charAt(0).toUpperCase() + segment.slice(1)
    return { href, title }
  })

  return (
    <header className="sticky top-0 z-50 w-full items-center border-b bg-background">
      <div className="flex h-[--header-height] w-full items-center gap-2 px-4">
        <Button className="h-8 w-8" variant="ghost" size="icon" onClick={toggleSidebar}>
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                <BreadcrumbSeparator />
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbItem>
                    <BreadcrumbLink href={crumb.href}>
                      {crumb.title}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                )}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Center title */}
        <div className="flex-1 flex items-center justify-center">
          <Rocket className="w-8 h-8 mr-2 text-rose-300" />
          <h1 
            className="text-2xl font-bold font-mono text-center text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-sky-400"
            style={{ letterSpacing: "1em" }}
          >
            &nbsp;SpaceY
          </h1>
          <Satellite className="w-8 h-8 ml-2 text-sky-400" />
        </div>

        <SearchForm className="w-full sm:ml-auto sm:w-auto" />
      </div>
    </header>
  )
}
