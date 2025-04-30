"use client"

import { useUser } from "@/contexts/UserContext"
import TierProgressBar from "@/components/tier-progress-bar"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Shield, Loader2 } from "lucide-react"

export default function ProgressPage() {
    const { user } = useUser()
    const router = useRouter()

    useEffect(() => {
        if (user === false) {
            router.replace('/')
            return
        }
        // Redirect admins to the tickets page
        if (user?.admin) {
            router.replace('/tickets')
        }
    }, [user, router])

    // Show loading state while user context is initializing
    if (user === undefined) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    // Show access denied if not authenticated
    if (user === false) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] p-4">
                <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                <p className="text-muted-foreground text-center">
                    Please log in to view your progress.
                </p>
            </div>
        )
    }

    // Show loading state while redirecting admin
    if (user?.admin) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto space-y-8">
                <TierProgressBar 
                    currentPoints={user.points} 
                    currentGrade={user.grade}
                />
            </div>
        </div>
    )
}
