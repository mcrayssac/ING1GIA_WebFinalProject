"use client"

import { useLoadScript } from "@react-google-maps/api"

const libraries = ["places", "geometry"]

export function MapsProvider({ children }) {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        libraries,
        // This prevents multiple script loading during development
        preventGoogleFontsLoading: true,
        // This helps with script cleanup
        googleMapsClientId: 'spacey-map',
    })

    if (loadError) {
        return (
            <div className="min-h-[200px] flex items-center justify-center">
                <div className="text-sm text-red-500">
                    Error loading maps
                </div>
            </div>
        )
    }

    if (!isLoaded) {
        return (
            <div className="min-h-[200px] flex items-center justify-center">
                <div className="animate-pulse text-sm text-muted-foreground">
                    Loading map...
                </div>
            </div>
        )
    }

    return children
}
