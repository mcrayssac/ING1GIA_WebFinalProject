"use client"

import React, { useState, useEffect, useMemo, useRef, Fragment } from "react"
import { GoogleMap, MarkerF, PolygonF, InfoWindowF } from "@react-google-maps/api"
import dynamic from "next/dynamic"
import { renderToStaticMarkup } from "react-dom/server"
import {
    Rocket,
    Home,
    Building2,
    Map,
    Search,
    MapPinned,
    MapPin,
    FlaskConical,
    Eye,
    EyeOff,
    ChevronDown,
    Filter,
    X,
    Layers,
    Info,
    Clock,
    CheckCircle2,
    XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarProvider,
} from "@/components/ui/sidebar"
import NoData from "@/components/no-data"
import Loading from "@/components/loading"
import { useToastAlert } from "@/contexts/ToastContext"
import { toast } from "sonner"

const markerMapping = {
    launch: { icon: Rocket, color: "oklch(var(--s))", label: "Launch Site" },
    hq: { icon: Home, color: "oklch(var(--nc))", label: "Headquarters" },
    office: { icon: Building2, color: "green", label: "Office" },
    test: { icon: FlaskConical, color: "purple", label: "Test Facility" },
}

const containerStyle = { width: "100%", height: "100%" }
const defaultCenter = { lat: 40.7128, lng: -74.0060 }

// Prevent SSR for map components to avoid hydration issues
const DynamicMap = dynamic(
    () => import("@react-google-maps/api").then((mod) => mod.GoogleMap),
    { ssr: false }
)

const DynamicMarker = dynamic(
    () => import("@react-google-maps/api").then((mod) => mod.MarkerF),
    { ssr: false }
)

const DynamicInfoWindow = dynamic(
    () => import("@react-google-maps/api").then((mod) => mod.InfoWindowF),
    { ssr: false }
)

const DynamicPolygon = dynamic(
    () => import("@react-google-maps/api").then((mod) => mod.PolygonF),
    { ssr: false }
)

export default function MapPage() {
    const { toastSuccess, toastError } = useToastAlert()
    const [sites, setSites] = useState([])
    const [loading, setLoading] = useState(true)
    const [legendQuery, setLegendQuery] = useState("")
    const [activeFilters, setActiveFilters] = useState([])
    const [visibleSiteIds, setVisibleSiteIds] = useState(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("visibleSiteIds")
            if (stored) {
                try {
                    return JSON.parse(stored)
                } catch (err) {
                    toastError("Error parsing visibleSiteIds from localStorage.")
                    console.error("Error parsing visibleSiteIds:", err)
                }
            }
        }
        return []
    })
    const [selectedSiteId, setSelectedSiteId] = useState(null)
    const [mapsApi, setMapsApi] = useState(null)
    const [effectiveColors, setEffectiveColors] = useState({
        launch: null,
        hq: null,
    })
    const [expandedSites, setExpandedSites] = useState({})

    const mapRef = useRef(null)

    // Compute effective colors for "launch" and "hq" after mount.
    useEffect(() => {
        if (typeof window !== "undefined") {
            const dummy = document.createElement("div")
            dummy.style.color = "oklch(var(--s))"
            document.body.appendChild(dummy)
            const launchColor = getComputedStyle(dummy).color
            dummy.style.color = "oklch(var(--nc))"
            const hqColor = getComputedStyle(dummy).color
            document.body.removeChild(dummy)
            setEffectiveColors({ launch: launchColor, hq: hqColor })
        }
    }, [])

    // Fetch sites data
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sites`)
            .then((res) => res.json())
            .then((data) => {
                setSites(data)
                const safeSites = Array.isArray(data) && data.length > 0 ? data : []
                const hasAny = safeSites.some((site) => visibleSiteIds.includes(site._id))
                if (!hasAny) {
                    setVisibleSiteIds(safeSites.map((s) => s._id))
                }
                setLoading(false)
            })
            .catch((err) => {
                toast.error("Error fetching sites data", { description: err.message })
                console.error(err)
                setLoading(false)
            })
    }, [])

    // Save visibleSiteIds to localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("visibleSiteIds", JSON.stringify(visibleSiteIds))
        }
    }, [visibleSiteIds])

    const toggleSiteVisibility = (id) => {
        setVisibleSiteIds((prev) => 
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        )
    }

    const toggleSiteExpansion = (id) => {
        setExpandedSites((prev) => ({
            ...prev,
            [id]: !prev[id],
        }))
    }

    const getColorForMarkerType = (type) => {
        if (type === "launch" || type === "hq") {
            return effectiveColors[type] || markerMapping[type].color
        }
        return markerMapping[type]?.color || "gray"
    }

    const availableMarkerTypes = useMemo(() => {
        const types = new Set()
        sites.forEach((site) => {
            if (site.markerType) types.add(site.markerType)
        })
        return Array.from(types)
    }, [sites])

    const toggleFilter = (type) => {
        setActiveFilters((prev) => 
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
        )
    }

    const filteredLegendSites = useMemo(() => {
        return sites.filter((site) => {
            const matchesSearch =
                site.name.toLowerCase().includes(legendQuery.toLowerCase()) ||
                site.description.toLowerCase().includes(legendQuery.toLowerCase()) ||
                site.openHours.toLowerCase().includes(legendQuery.toLowerCase())

            const matchesFilter = activeFilters.length === 0 || activeFilters.includes(site.markerType)

            return matchesSearch && matchesFilter
        })
    }, [sites, legendQuery, activeFilters])

    const mapSites = useMemo(() => {
        return filteredLegendSites.filter((site) => visibleSiteIds.includes(site._id))
    }, [filteredLegendSites, visibleSiteIds])

    const fitMapToMarkers = () => {
        if (!mapRef.current || mapSites.length === 0 || !mapsApi) return
        const bounds = new mapsApi.LatLngBounds()
        mapSites.forEach((site) => {
            const { lat, lng } = Array.isArray(site.coordinates)
                ? { lat: site.coordinates[0], lng: site.coordinates[1] }
                : site.coordinates
            bounds.extend({ lat, lng })
        })
        mapRef.current.fitBounds(bounds)
    }

    const centerMapOnSite = (site) => {
        if (!mapRef.current) return
        const { lat, lng } = Array.isArray(site.coordinates)
            ? { lat: site.coordinates[0], lng: site.coordinates[1] }
            : site.coordinates
        mapRef.current.panTo({ lat, lng })
        mapRef.current.setZoom(15)
        setSelectedSiteId(site._id)
    }

    const onMapLoad = (map) => {
        mapRef.current = map
        setMapsApi(window.google.maps)
        if (mapSites.length > 0) {
            fitMapToMarkers()
        }
    }

    useEffect(() => {
        if (mapRef.current && mapsApi && mapSites.length > 0) {
            fitMapToMarkers()
        }
    }, [mapSites, mapsApi])

    const getMarkerIcon = (site) => {
        if (!mapsApi) return null
        const mapping = markerMapping[site.markerType] || { icon: Rocket, color: "gray" }
        const color = getColorForMarkerType(site.markerType)
        const svgMarkup = renderToStaticMarkup(<mapping.icon color={color} size={24} />)
        return {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgMarkup)}`,
            scaledSize: new mapsApi.Size(30, 30),
            anchor: new mapsApi.Point(15, 30),
        }
    }

    const toggleAllSites = () => {
        if (visibleSiteIds.length === filteredLegendSites.length) {
            setVisibleSiteIds([])
        } else {
            setVisibleSiteIds(filteredLegendSites.map((site) => site._id))
        }
    }

    const clearFilters = () => {
        setActiveFilters([])
        setLegendQuery("")
    }

    return (
        <div className="container mt-8 mx-auto px-4 py-8">
            <div className="flex items-center space-x-4">
                <Map className="w-8 h-8" />
                <h1 className="text-4xl font-black font-mono text-start">Sites Map</h1>
            </div>

            <div className="flex h-screen mt-12 space-x-4">
                {loading && <Loading />}
                {!loading && sites.length === 0 && <NoData message="No sites data available" />}
                {!loading && sites.length > 0 && (
                    <>
                        {/* Map Section */}
                        <div
                            className="relative rounded-2xl overflow-hidden shadow-xl"
                            style={{ width: "60%", height: "100%", zIndex: 0 }}
                        >
                            <DynamicMap
                                mapContainerStyle={containerStyle}
                                center={defaultCenter}
                                zoom={10}
                                onLoad={onMapLoad}
                            >
                                {mapsApi && mapSites.map((site) => (
                                    <Fragment key={site._id}>
                                        <DynamicMarker
                                            position={
                                                Array.isArray(site.coordinates)
                                                    ? { lat: site.coordinates[0], lng: site.coordinates[1] }
                                                    : site.coordinates
                                            }
                                            onClick={() => setSelectedSiteId(site._id)}
                                            icon={getMarkerIcon(site)}
                                        />
                                        {selectedSiteId === site._id && (
                                            <DynamicInfoWindow
                                                position={
                                                    Array.isArray(site.coordinates)
                                                        ? { lat: site.coordinates[0], lng: site.coordinates[1] }
                                                        : site.coordinates
                                                }
                                                onCloseClick={() => setSelectedSiteId(null)}
                                            >
                                                <div className="flex flex-col gap-4 bg-white p-4 w-[300px] shadow-sm rounded-sm relative">
                                                    <div className="flex items-center gap-2 pb-2 border-b">
                                                        {React.createElement(
                                                            markerMapping[site.markerType]?.icon || Rocket,
                                                            {
                                                                className: "w-6 h-6",
                                                                style: { color: getColorForMarkerType(site.markerType) },
                                                            }
                                                        )}
                                                        <h2
                                                            className="text-lg font-bold font-mono"
                                                            style={{ color: getColorForMarkerType(site.markerType) }}
                                                        >
                                                            {site.name}
                                                        </h2>
                                                    </div>
                                                    <p className="text-sm font-mono leading-relaxed break-words max-h-[120px] overflow-auto pr-2">
                                                        {site.description}
                                                    </p>
                                                    <p className="text-sm text-gray-600 font-medium">
                                                        Open Hours: {site.openHours}
                                                    </p>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="mt-2"
                                                        onClick={() => centerMapOnSite(site)}
                                                    >
                                                        <MapPinned className="w-4 h-4 mr-1" />
                                                        Center Map
                                                    </Button>
                                                </div>
                                            </DynamicInfoWindow>
                                        )}
                                        {site.geometry && Array.isArray(site.geometry) && (
                                            <DynamicPolygon
                                                paths={site.geometry.map((pt) =>
                                                    Array.isArray(pt) ? { lat: pt[0], lng: pt[1] } : pt
                                                )}
                                                options={{
                                                    strokeColor: getColorForMarkerType(site.markerType),
                                                    strokeOpacity: 0.8,
                                                    strokeWeight: 2,
                                                    fillColor: getColorForMarkerType(site.markerType),
                                                    fillOpacity: 0.2,
                                                }}
                                            />
                                        )}
                                    </Fragment>
                                ))}
                            </DynamicMap>
                        </div>

                        {/* Legend Section */}
                        <div className="rounded-2xl shadow-xl overflow-hidden border" style={{ width: "40%", height: "100%" }}>
                            <SidebarProvider>
                                <Sidebar
                                    collapsible="none"
                                    className="h-full border-none w-full !max-w-full"
                                    style={{ "--sidebar-width": "100%" }}
                                >
                                    <SidebarHeader className="border-b p-4 bg-primary/5 w-full">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <Layers className="w-5 h-5" />
                                                <h3 className="text-xl font-bold">Legend</h3>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="outline" size="sm" onClick={toggleAllSites} className="h-8">
                                                                {visibleSiteIds.length === filteredLegendSites.length ? (
                                                                    <EyeOff className="h-4 w-4 mr-1" />
                                                                ) : (
                                                                    <Eye className="h-4 w-4 mr-1" />
                                                                )}
                                                                {visibleSiteIds.length === filteredLegendSites.length ? "Hide All" : "Show All"}
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {visibleSiteIds.length === filteredLegendSites.length
                                                                ? "Hide all sites"
                                                                : "Show all sites"}
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="outline" size="sm" onClick={fitMapToMarkers} className="h-8">
                                                                <MapPinned className="h-4 w-4 mr-1" />
                                                                Fit Map
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Fit map to visible markers</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <div className="relative">
                                                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search sites..."
                                                    value={legendQuery}
                                                    onChange={(e) => setLegendQuery(e.target.value)}
                                                    className="pl-8 pr-8"
                                                />
                                                {legendQuery && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                                                        onClick={() => setLegendQuery("")}
                                                    >
                                                        <X className="h-4 w-4" />
                                                        <span className="sr-only">Clear search</span>
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="outline" className="flex items-center gap-1">
                                                    <Filter className="h-3 w-3" />
                                                    Filters
                                                    {(activeFilters.length > 0 || legendQuery) && (
                                                        <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={clearFilters}>
                                                            <X className="h-3 w-3" />
                                                            <span className="sr-only">Clear filters</span>
                                                        </Button>
                                                    )}
                                                </Badge>

                                                {availableMarkerTypes.map((type) => (
                                                    <Badge
                                                        key={type}
                                                        variant={activeFilters.includes(type) ? "default" : "outline"}
                                                        className="cursor-pointer"
                                                        onClick={() => toggleFilter(type)}
                                                        style={{
                                                            backgroundColor: activeFilters.includes(type)
                                                                ? getColorForMarkerType(type)
                                                                : "transparent",
                                                            borderColor: getColorForMarkerType(type),
                                                            color: activeFilters.includes(type) ? "white" : getColorForMarkerType(type),
                                                        }}
                                                    >
                                                        {React.createElement(markerMapping[type]?.icon || Rocket, {
                                                            className: "h-3 w-3 mr-1",
                                                        })}
                                                        {markerMapping[type]?.label || type}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </SidebarHeader>

                                    <SidebarContent className="p-0 w-full flex flex-col">
                                        <SidebarGroup className="w-full flex-none">
                                            <SidebarGroupContent className="w-full">
                                                <SidebarMenu className="w-full">
                                                    {filteredLegendSites.length === 0 ? (
                                                        <div className="flex flex-col items-center justify-center p-8 text-center">
                                                            <Search className="h-12 w-12 text-muted-foreground mb-4" />
                                                            <h3 className="text-lg font-medium">No sites found</h3>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                Try adjusting your search or filters
                                                            </p>
                                                            <Button variant="outline" className="mt-4" onClick={clearFilters}>
                                                                Clear filters
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="divide-y w-full overflow-auto h-[calc(100vh-230px)]">
                                                            {filteredLegendSites.map((site) => {
                                                                const mapping = markerMapping[site.markerType] || { icon: Rocket, color: "gray" }
                                                                const IconComponent = mapping.icon
                                                                const isVisible = visibleSiteIds.includes(site._id)
                                                                const isExpanded = expandedSites[site._id]

                                                                return (
                                                                    <Collapsible
                                                                        key={site._id}
                                                                        open={isExpanded}
                                                                        onOpenChange={() => toggleSiteExpansion(site._id)}
                                                                        className="w-full"
                                                                    >
                                                                        <SidebarMenuItem className="px-0 w-full">
                                                                            <div
                                                                                className={cn(
                                                                                    "flex items-center w-full p-3",
                                                                                    isVisible ? "bg-primary/5" : "bg-transparent",
                                                                                    "hover:bg-primary/10 transition-colors"
                                                                                )}
                                                                            >
                                                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                                    <div
                                                                                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                                                                                        style={{ backgroundColor: `${getColorForMarkerType(site.markerType)}20` }}
                                                                                    >
                                                                                        <IconComponent
                                                                                            className="w-4 h-4"
                                                                                            style={{ color: getColorForMarkerType(site.markerType) }}
                                                                                        />
                                                                                    </div>

                                                                                    <div className="flex-1 min-w-0">
                                                                                        <div className="flex items-center">
                                                                                            <h4 className="text-sm font-medium truncate mr-1">{site.name}</h4>
                                                                                            <Badge
                                                                                                variant="outline"
                                                                                                className="text-xs"
                                                                                                style={{
                                                                                                    borderColor: getColorForMarkerType(site.markerType),
                                                                                                    color: getColorForMarkerType(site.markerType),
                                                                                                }}
                                                                                            >
                                                                                                {markerMapping[site.markerType]?.label || site.markerType}
                                                                                            </Badge>
                                                                                        </div>
                                                                                        <p className="text-xs text-muted-foreground truncate">
                                                                                            {site.description}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="flex items-center gap-2 ml-2">
                                                                                    <Tooltip>
                                                                                        <TooltipTrigger asChild>
                                                                                            <Button
                                                                                                variant="ghost"
                                                                                                size="icon"
                                                                                                className="h-8 w-8"
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation()
                                                                                                    toggleSiteVisibility(site._id)
                                                                                                }}
                                                                                            >
                                                                                                {isVisible ? (
                                                                                                    <Eye className="h-4 w-4" />
                                                                                                ) : (
                                                                                                    <EyeOff className="h-4 w-4" />
                                                                                                )}
                                                                                            </Button>
                                                                                        </TooltipTrigger>
                                                                                        <TooltipContent>
                                                                                            {isVisible ? "Hide from map" : "Show on map"}
                                                                                        </TooltipContent>
                                                                                    </Tooltip>

                                                                                    <Tooltip>
                                                                                        <TooltipTrigger asChild>
                                                                                            <Button
                                                                                                variant="ghost"
                                                                                                size="icon"
                                                                                                className="h-8 w-8"
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation()
                                                                                                    centerMapOnSite(site)
                                                                                                }}
                                                                                            >
                                                                                                <MapPinned className="h-4 w-4" />
                                                                                            </Button>
                                                                                        </TooltipTrigger>
                                                                                        <TooltipContent>Center map on this site</TooltipContent>
                                                                                    </Tooltip>

                                                                                    <CollapsibleTrigger asChild>
                                                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                                            <ChevronDown
                                                                                                className={cn(
                                                                                                    "h-4 w-4 transition-transform",
                                                                                                    isExpanded && "rotate-180"
                                                                                                )}
                                                                                            />
                                                                                        </Button>
                                                                                    </CollapsibleTrigger>
                                                                                </div>
                                                                            </div>

                                                                            <CollapsibleContent>
                                                                                <div className="p-3 pt-0 pl-14 bg-muted/30">
                                                                                    <div className="space-y-3">
                                                                                        <div className="flex items-start gap-2">
                                                                                            <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
                                                                                            <div className="flex-1">
                                                                                                <h5 className="text-xs font-medium">Description</h5>
                                                                                                <p className="text-sm">{site.description}</p>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="flex items-start gap-2">
                                                                                            <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                                                                                            <div className="flex-1">
                                                                                                <h5 className="text-xs font-medium">Open Hours</h5>
                                                                                                <p className="text-sm">{site.openHours}</p>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="flex items-start gap-2">
                                                                                            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                                                                                            <div className="flex-1">
                                                                                                <h5 className="text-xs font-medium">Status</h5>
                                                                                                <div className="flex items-center gap-1 mt-1">
                                                                                                    {isVisible ? (
                                                                                                        <>
                                                                                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                                                                                            <span className="text-sm text-green-600">
                                                                                                                Visible on map
                                                                                                            </span>
                                                                                                        </>
                                                                                                    ) : (
                                                                                                        <>
                                                                                                            <XCircle className="w-3.5 h-3.5 text-red-500" />
                                                                                                            <span className="text-sm text-red-600">
                                                                                                                Hidden from map
                                                                                                            </span>
                                                                                                        </>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </CollapsibleContent>
                                                                        </SidebarMenuItem>
                                                                    </Collapsible>
                                                                )
                                                            })}
                                                        </div>
                                                    )}
                                                </SidebarMenu>
                                            </SidebarGroupContent>
                                        </SidebarGroup>
                                    </SidebarContent>

                                    <SidebarFooter className="p-4 border-t w-full">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-muted-foreground">{filteredLegendSites.length} sites found</div>
                                            <div className="text-sm">{visibleSiteIds.length} visible on map</div>
                                        </div>
                                    </SidebarFooter>
                                </Sidebar>
                            </SidebarProvider>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
