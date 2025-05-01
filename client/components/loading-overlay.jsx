"use client"

import { useCallback, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/**
 * A loading overlay component that appears during navigation.
 * 
 * To bypass the loading overlay for specific buttons or links:
 * - Add data-action="close-overlay" attribute to the element
 * 
 * Example:
 * ```jsx
 * <Button data-action="close-overlay" onClick={() => {}}>
 *   No Loading Overlay
 * </Button>
 * ```
 */
export function LoadingOverlay() {
    const pathname = usePathname()
    const [show, setShow] = useState(false)
    const [loading, setLoading] = useState(false)
    const handleNavigationStart = useCallback(() => {
        setShow(true)
        setLoading(true)
    }, [])

    const handleNavigationEnd = useCallback(() => {
        setLoading(false)
        setTimeout(() => setShow(false), 300) // Allow time for fade out
    }, [])

    // Handle route changes
    useEffect(() => {
        handleNavigationEnd()
    }, [pathname, handleNavigationEnd])

    // Handle navigation clicks
    useEffect(() => {
        const handleClick = (e) => {
            const target = e.target.closest('a, button')
            if (!target) return

            // Don't show overlay for close button clicks
            if (target.dataset.action === 'close-overlay') return

            const isNavLink = target.tagName === 'A' && target.href && !target.href.startsWith('#') && !target.target
            const isNavButton = target.tagName === 'BUTTON' && (
                target.dataset.navigation === 'true' || 
                target.onclick?.toString().includes('router.push') || 
                target.onclick?.toString().includes('router.replace') ||
                target.closest('form')
            )

            if (isNavLink || isNavButton) {
                handleNavigationStart()
                // Auto-hide if no actual navigation occurs
                setTimeout(() => {
                    handleNavigationEnd()
                }, 3000)
            }
        }

        document.addEventListener('click', handleClick, true)
        return () => document.removeEventListener('click', handleClick, true)
    }, [handleNavigationStart, handleNavigationEnd])

    if (!show) return null

    return (
        <div
            className={cn(
                "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
                "flex items-center justify-center",
                "transition-opacity duration-300",
                loading ? "opacity-100" : "opacity-0"
            )}
        >
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 rounded-full hover:bg-background/20"
                onClick={handleNavigationEnd}
                data-action="close-overlay"
            >
                <X className="h-6 w-6 text-muted-foreground" />
                <span className="sr-only">Close loading overlay</span>
            </Button>
            <div className="flex items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground text-sm">Loading...</span>
            </div>
        </div>
    )
}
