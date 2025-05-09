"use client"

import React, { useEffect, useState, useRef } from "react"
import { usePathname } from "next/navigation"
import { SidebarIcon } from "lucide-react"
import { motion } from "framer-motion"
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

// Earth SVG component with primary color
const EarthSVG = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className={className} fill="currentColor">
        <path d="M266.3 48.3L232.5 73.6c-5.4 4-8.5 10.4-8.5 17.1l0 9.1c0 6.8 5.5 12.3 12.3 12.3c2.4 0 4.8-.7 6.8-2.1l41.8-27.9c2-1.3 4.4-2.1 6.8-2.1l1 0c6.2 0 11.3 5.1 11.3 11.3c0 3-1.2 5.9-3.3 8l-19.9 19.9c-5.8 5.8-12.9 10.2-20.7 12.8l-26.5 8.8c-5.8 1.9-9.6 7.3-9.6 13.4c0 3.7-1.5 7.3-4.1 10l-17.9 17.9c-6.4 6.4-9.9 15-9.9 24l0 4.3c0 16.4 13.6 29.7 29.9 29.7c11 0 21.2-6.2 26.1-16l4-8.1c2.4-4.8 7.4-7.9 12.8-7.9c4.5 0 8.7 2.1 11.4 5.7l16.3 21.7c2.1 2.9 5.5 4.5 9.1 4.5c8.4 0 13.9-8.9 10.1-16.4l-1.1-2.3c-3.5-7 0-15.5 7.5-18l21.2-7.1c7.6-2.5 12.7-9.6 12.7-17.6c0-10.3 8.3-18.6 18.6-18.6l29.4 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-20.7 0c-7.2 0-14.2 2.9-19.3 8l-4.7 4.7c-2.1 2.1-3.3 5-3.3 8c0 6.2 5.1 11.3 11.3 11.3l11.3 0c6 0 11.8 2.4 16 6.6l6.5 6.5c1.8 1.8 2.8 4.3 2.8 6.8s-1 5-2.8 6.8l-7.5 7.5C386 262 384 266.9 384 272s2 10 5.7 13.7L408 304c10.2 10.2 24.1 16 38.6 16l7.3 0c6.5-20.2 10-41.7 10-64c0-111.4-87.6-202.4-197.7-207.7zm172 307.9c-3.7-2.6-8.2-4.1-13-4.1c-6 0-11.8-2.4-16-6.6L396 332c-7.7-7.7-18-12-28.9-12c-9.7 0-19.2-3.5-26.6-9.8L314 287.4c-11.6-9.9-26.4-15.4-41.7-15.4l-20.9 0c-12.6 0-25 3.7-35.5 10.7L188.5 301c-17.8 11.9-28.5 31.9-28.5 53.3l0 3.2c0 17 6.7 33.3 18.7 45.3l16 16c8.5 8.5 20 13.3 32 13.3l21.3 0c13.3 0 24 10.7 24 24c0 2.5 .4 5 1.1 7.3c71.3-5.8 132.5-47.6 165.2-107.2zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM187.3 100.7c-6.2-6.2-16.4-6.2-22.6 0l-32 32c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0l32-32c6.2-6.2 6.2-16.4 0-22.6z" />
    </svg>
)

// Astronaut SVG component with secondary color
const AstronautSVG = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className={className} fill="currentColor">
        <path d="M370.7 96.1C346.1 39.5 289.7 0 224 0S101.9 39.5 77.3 96.1C60.9 97.5 48 111.2 48 128v64c0 16.8 12.9 30.5 29.3 31.9C101.9 280.5 158.3 320 224 320s122.1-39.5 146.7-96.1c16.4-1.4 29.3-15.1 29.3-31.9v-64c0-16.8-12.9-30.5-29.3-31.9zM336 144v16c0 53-43 96-96 96h-32c-53 0-96-43-96-96v-16c0-26.5 21.5-48 48-48h128c26.5 0 48 21.5 48 48zM189.3 162.7l-6-21.2c-.9-3.3-3.9-5.5-7.3-5.5s-6.4 2.2-7.3 5.5l-6 21.2-21.2 6c-3.3.9-5.5 3.9-5.5 7.3s2.2 6.4 5.5 7.3l21.2 6 6 21.2c.9 3.3 3.9 5.5 7.3 5.5s6.4-2.2 7.3-5.5l6-21.2 21.2-6c3.3-.9 5.5-3.9 5.5-7.3s-2.2-6.4-5.5-7.3l-21.2-6zM112.7 316.5C46.7 342.6 0 407 0 482.3 0 498.7 13.3 512 29.7 512h98.3v-64c0-17.7 14.3-32 32-32h128c17.7 0 32 14.3 32 32v64h98.3c16.4 0 29.7-13.3 29.7-29.7 0-75.3-46.7-139.7-112.7-165.8C303.9 338.8 265.5 352 224 352s-79.9-13.2-111.3-35.5zM176 448c-8.8 0-16 7.2-16 16v48h32v-48c0-8.8-7.2-16-16-16zm96 32a16 16 0 100-32 16 16 0 100 32z" />
    </svg>
)

export function SiteHeader() {
    const { toggleSidebar } = useSidebar()
    const pathname = usePathname()
    const pathSegments = pathname.split("/").filter(Boolean)
    const breadcrumbs = pathSegments.map((segment, index) => {
        const href = "/" + pathSegments.slice(0, index + 1).join("/")
        const title = segment.charAt(0).toUpperCase() + segment.slice(1)
        return { href, title }
    })

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
            className="sticky top-0 z-50 w-full items-center border-b bg-background/80 backdrop-blur-sm"
        >
            <div className="flex h-[--header-height] w-full items-center gap-2 px-4">
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                    <Button className="h-8 w-8" variant="ghost" size="icon" onClick={toggleSidebar}>
                        <SidebarIcon />
                    </Button>
                </motion.div>
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb className="hidden sm:block">
                    <BreadcrumbList className="flex items-center">
                        <BreadcrumbItem>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1, duration: 0.5 }}
                                className="inline-flex"
                            >
                                <BreadcrumbLink href="/">Home</BreadcrumbLink>
                            </motion.div>
                        </BreadcrumbItem>
                        {breadcrumbs.map((crumb, index) => (
                            <React.Fragment key={crumb.href}>
                                <BreadcrumbSeparator />
                                {index === breadcrumbs.length - 1 ? (
                                    <BreadcrumbPage>
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 * (index + 1), duration: 0.5 }}
                                            className="inline-flex"
                                        >
                                            {crumb.title}
                                        </motion.div>
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbItem>
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 * (index + 1), duration: 0.5 }}
                                            className="inline-flex"
                                        >
                                            <BreadcrumbLink href={crumb.href}>{crumb.title}</BreadcrumbLink>
                                        </motion.div>
                                    </BreadcrumbItem>
                                )}
                            </React.Fragment>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Logo section with whole text animation */}
                <div className="flex-1 flex items-center justify-center gap-14">
                    {/* Earth SVG with primary color */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{
                            opacity: 1,
                            scale: [1, 1.1, 1],
                            rotate: 360,
                            y: [0, -5, 0]
                        }}
                        transition={{
                            duration: 0.5,
                            rotate: {
                                duration: 20,
                                ease: "linear",
                                repeat: Number.POSITIVE_INFINITY,
                            },
                            scale: {
                                duration: 4,
                                repeat: Number.POSITIVE_INFINITY,
                                repeatType: "reverse",
                            },
                            y: {
                                duration: 3,
                                repeat: Number.POSITIVE_INFINITY,
                                repeatType: "reverse",
                                ease: "easeInOut"
                            }
                        }}
                        className="text-primary hidden md:block"
                    >
                        <EarthSVG className="w-8 h-8" />
                    </motion.div>

                    {/* SpaceY Text with letter zoom animation */}
                    <div className="relative">
                        {/* Blur effect behind text */}
                        <div 
                            className="absolute -inset-x-8 inset-y-0 blur-xl opacity-20"
                            style={{
                                background: "linear-gradient(to right, oklch(var(--p)), oklch(var(--s)))"
                            }}
                        />
                        <motion.div 
                            className="text-2xl font-bold font-mono uppercase relative"
                            style={{
                                background: "linear-gradient(to right, oklch(var(--p)), oklch(var(--s)))",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                                color: "transparent",
                                display: "flex",
                                gap: "0.2em",
                                justifyContent: "space-between",
                                width: "8em",
                            }}
                        >
                            {"SPACEY".split("").map((letter, index) => (
                                <motion.span
                                    key={index}
                                    initial={{ scale: 1 }}
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{
                                        duration: 0.6,
                                        repeat: Infinity,
                                        repeatDelay: 5,
                                        delay: index * 0.1,
                                        ease: "easeInOut"
                                    }}
                                >
                                    {letter}
                                </motion.span>
                            ))}
                        </motion.div>
                    </div>

                    {/* Astronaut SVG with secondary color */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{
                            opacity: 1,
                            scale: [1, 1.1, 1],
                            rotate: [-5, 5, -5],
                            y: [0, -8, 0],
                        }}
                        transition={{
                            duration: 0.5,
                            delay: 0.3,
                            scale: {
                                duration: 4,
                                repeat: Number.POSITIVE_INFINITY,
                                repeatType: "reverse",
                                ease: "easeInOut",
                            },
                            rotate: {
                                duration: 6,
                                repeat: Number.POSITIVE_INFINITY,
                                repeatType: "reverse",
                                ease: "easeInOut",
                            },
                            y: {
                                duration: 3,
                                repeat: Number.POSITIVE_INFINITY,
                                repeatType: "reverse",
                                ease: "easeInOut",
                            },
                        }}
                        className="text-secondary hidden md:block"
                    >
                        <AstronautSVG className="w-8 h-8" />
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <SearchForm className="ml-auto hidden md:block" />
                </motion.div>
            </div>
        </motion.header>
    )
}
