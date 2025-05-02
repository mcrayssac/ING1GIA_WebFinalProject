"use client"

import React from "react";

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

import { navGuest, navUser, navAdmin, navSecondary } from "@/data/data";
import { useUser } from "@/contexts/UserContext";

export function AppSidebar({ ...props }) {
    const { user } = useUser();

    return (
        (<Sidebar
            className="top-[--header-height] !h-[calc(100svh-var(--header-height))]"
            {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a>
                                <div className="flex aspect-square size-8 items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground">
                                    <img src="/pictures/spacey_logo.png" alt="SpaceX" className="rounded-lg" />
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
                <div className="space-y-4">
                    {/* Main Navigation - always visible */}
                    <NavMain object={navGuest} />

                    {/* User Navigation when logged in */}
                    {user && (
                        <NavMain object={navUser} />
                    )}

                    {/* Admin Navigation for admin users */}
                    {user?.admin && (
                        <NavMain object={navAdmin} />
                    )}
                </div>
                
                <NavSecondary items={navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>)
    );
}
