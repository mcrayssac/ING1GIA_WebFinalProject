"use client"

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

import { navGuest, navUser, navAdmin, navSecondary } from "@/data/data";
import { useUser } from "@/contexts/UserContext";

const sidebarVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.4,
            when: "beforeChildren",
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
};

export function AppSidebar({ ...props }) {
    const { user } = useUser();

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={sidebarVariants}
        >
            <Sidebar
            className="top-[--header-height] !h-[calc(100svh-var(--header-height))]"
            {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <motion.div variants={itemVariants}>
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
                    </motion.div>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <div className="flex flex-col h-full">
                    <motion.div variants={itemVariants} className="space-y-4">
                        {/* Main Navigation - always visible */}
                        <NavMain object={navGuest} />

                        {/* User Navigation when logged in */}
                        <AnimatePresence mode="wait">
                            {user && (
                                <motion.div
                                    key="user-nav"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <NavMain object={navUser} />
                                </motion.div>
                            )}

                            {/* Admin Navigation for admin users */}
                            {user?.admin && (
                                <motion.div
                                    key="admin-nav"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <NavMain object={navAdmin} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="mt-auto">
                        <NavSecondary items={navSecondary} />
                    </motion.div>
                </div>
            </SidebarContent>
            <motion.div variants={itemVariants}>
                <SidebarFooter>
                    <NavUser />
                </SidebarFooter>
            </motion.div>
        </Sidebar>
        </motion.div>
    );
}
