"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { LoadingOverlay } from "@/components/loading-overlay"
import Footer from "@/components/footer"
import { UserProvider } from "@/contexts/UserContext"
import { ToastProvider } from "@/contexts/ToastContext"
import { Toaster } from "@/components/ui/sonner"

export function ClientLayout({ children }) {
    return (
        <UserProvider>
            <ToastProvider>
                <SidebarProvider className="flex flex-col min-h-screen">
                    <SiteHeader />
                    <div className="flex flex-1">
                        <AppSidebar />
                        <SidebarInset>
                            <div className="flex flex-1 flex-col gap-4 p-4">
                                {children}
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
