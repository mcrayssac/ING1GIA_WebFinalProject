"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { LoadingOverlay } from "@/components/loading-overlay"
import { MapsProvider } from "@/components/maps-provider"
import Footer from "@/components/footer"
import { UserProvider } from "@/contexts/UserContext"
import { ToastProvider } from "@/contexts/ToastContext"
import { Toaster } from "@/components/ui/sonner"
import { usePathname } from "next/navigation"

export function ClientLayout({ children }) {
    const pathname = usePathname()
    const isMapPage = pathname === "/map"
    return (
        <UserProvider>
            <ToastProvider>
                <SidebarProvider className="flex flex-col min-h-screen">
                    <SiteHeader />
                    <div className="flex flex-1">
                        <AppSidebar />
                        <SidebarInset>
                            <div className="flex flex-1 flex-col gap-4 p-4 h-screen">
                                {isMapPage ? (
                                    <MapsProvider>{children}</MapsProvider>
                                ) : (
                                    children
                                )}
                                <Footer />
                            </div>
                        </SidebarInset>
                    </div>
                </SidebarProvider>
                <Toaster richColors position="bottom-right" />
                <LoadingOverlay />
            </ToastProvider>
        </UserProvider>
    )
}
