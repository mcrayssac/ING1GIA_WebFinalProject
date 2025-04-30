"use client"

import { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function LoadingOverlay() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const timeoutId = setTimeout(() => setLoading(false), 500)
        setLoading(true)
        return () => clearTimeout(timeoutId)
    }, [pathname, searchParams])

    if (!loading) return null

    return (
        <div
            className={cn(
                "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
                "flex items-center justify-center transition-opacity duration-300",
                loading ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
        >
            <div className="flex items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground text-sm">Loading...</span>
            </div>
        </div>
    )
}
