"use client"

import React, { useState, useEffect, useMemo, useRef, Fragment } from "react"
import { GoogleMap, MarkerF, PolygonF, InfoWindowF } from "@react-google-maps/api"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { renderToStaticMarkup } from "react-dom/server"
import { motion, AnimatePresence } from "framer-motion"
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

const mapContainerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut",
        },
    },
}

const sidebarItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.3,
            ease: "easeOut",
        },
    },
}

const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.4 },
    },
}

const pulseVariants = {
    initial: { scale: 1 },
    pulse: {
        scale: [1, 1.05, 1],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            repeatType: "loop",
        },
    },
}

const sidebarContainerVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            type: "spring",
            damping: 25,
            stiffness: 300,
            when: "beforeChildren",
            staggerChildren: 0.1,
        },
    },
}

const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            damping: 12,
        },
    },
    hover: {
        scale: 1.1,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 10,
        },
    },
}

const iconAnimationVariants = {
    hover: {
        rotate: [0, 15, -15, 0],
        transition: {
            duration: 0.6,
            ease: "easeInOut",
        },
    },
    tap: {
        scale: 0.9,
        transition: {
            type: "spring",
            stiffness: 400,
        },
    },
    rotating: {
        rotate: 360,
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "linear",
        },
    },
}

const expandCollapseVariants = {
    hidden: {
        height: 0,
        opacity: 0,
    },
    visible: {
        height: "auto",
        opacity: 1,
        transition: {
            height: {
                type: "spring",
                stiffness: 300,
                damping: 30,
            },
            opacity: {
                duration: 0.2,
                delay: 0.1,
            },
        },
    },
}

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
    const router = useRouter()
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
        <motion.div
            className="container mt-8 mx-auto px-4 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                className="flex items-center space-x-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                    }}
                >
                    <Map className="w-8 h-8" />
                </motion.div>
                <h1 className="text-4xl font-black font-mono text-start">Sites Map</h1>
            </motion.div>

            <motion.div
                className="flex h-screen mt-12 space-x-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                {loading && <Loading />}
                {!loading && sites.length === 0 && <NoData message="No sites data available" />}
                {!loading && sites.length > 0 && (
                    <>
                        {/* Map Section */}
                        <motion.div
                            className="relative rounded-2xl overflow-hidden shadow-xl"
                            style={{ width: "60%", height: "100%", zIndex: 0 }}
                            initial="hidden"
                            animate="visible"
                            variants={mapContainerVariants}
                        >
                            <DynamicMap
                                mapContainerStyle={containerStyle}
                                center={defaultCenter}
                                zoom={10}
                                onLoad={onMapLoad}
                            >
                                {mapsApi && mapSites.map((site, index) => (
                                    <motion.div
                                        key={site._id}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
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
                                                <div className="flex flex-col gap-4 bg-background p-4 w-[300px] shadow-sm rounded-sm relative">
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
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            className="mt-2 flex-1"
                                                            onClick={() => centerMapOnSite(site)}
                                                        >
                                                            <MapPinned className="w-4 h-4 mr-1" />
                                                            Center Map
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="mt-2 flex-1"
                                                            onClick={() => router.push(`/map/${site._id}`)}
                                                            data-navigation="true"
                                                        >
                                                            <Info className="w-4 h-4 mr-1" />
                                                            View Details
                                                        </Button>
                                                    </div>
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
                                    </motion.div>
                                ))}
                            </DynamicMap>
                        </motion.div>

                        {/* Legend Section */}
                        <motion.div
                            className="rounded-2xl shadow-xl overflow-hidden border"
                            style={{ width: "40%", height: "100%" }}
                            initial="hidden"
                            animate="visible"
                            variants={sidebarContainerVariants}
                            whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                            transition={{ boxShadow: { duration: 0.2 } }}
                        >
                            <SidebarProvider>
                                <Sidebar
                                    collapsible="none"
                                    className="h-full border-none w-full !max-w-full"
                                    style={{ "--sidebar-width": "100%" }}
                                >
                                    <SidebarHeader className="border-b p-4 bg-primary/5 w-full">
                                        <motion.div
                                            className="flex items-center justify-between mb-4"
                                            initial="hidden"
                                            animate="visible"
                                            variants={fadeInVariants}
                                        >
                                            <motion.div 
                                                className="flex items-center gap-2"
                                                whileHover={{ x: 3 }}
                                                transition={{ type: "spring", stiffness: 400 }}
                                            >
                                                <motion.div
                                                    animate={{
                                                        rotate: [0, 180, 360],
                                                    }}
                                                    transition={{
                                                        duration: 8,
                                                        repeat: Infinity,
                                                        repeatType: "loop",
                                                        ease: "linear",
                                                    }}
                                                >
                                                    <Layers className="w-5 h-5 text-primary" />
                                                </motion.div>
                                                <motion.h3 
                                                    className="text-xl font-bold"
                                                    initial={{ y: -10, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    transition={{ delay: 0.2, type: "spring" }}
                                                >
                                                    Legend
                                                </motion.h3>
                                            </motion.div>
                                            <div className="flex items-center gap-2">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <motion.div
                                                                whileHover="hover"
                                                                whileTap="tap"
                                                                variants={iconAnimationVariants}
                                                            >
                                                                <Button variant="outline" size="sm" onClick={toggleAllSites} className="h-8">
                                                                    <motion.div
                                                                        animate={{ scale: [1, 1.1, 1] }}
                                                                        transition={{ 
                                                                            repeat: Infinity, 
                                                                            repeatDelay: 2, 
                                                                            duration: 0.5 
                                                                        }}
                                                                    >
                                                                        {visibleSiteIds.length === filteredLegendSites.length ? (
                                                                            <EyeOff className="h-4 w-4 mr-1" />
                                                                        ) : (
                                                                            <Eye className="h-4 w-4 mr-1" />
                                                                        )}
                                                                    </motion.div>
                                                                    {visibleSiteIds.length === filteredLegendSites.length ? "Hide All" : "Show All"}
                                                                </Button>
                                                            </motion.div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {visibleSiteIds.length === filteredLegendSites.length
                                                                ? "Hide all sites"
                                                                : "Show all sites"}
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <motion.div
                                                                whileHover="hover"
                                                                whileTap="tap"
                                                                variants={iconAnimationVariants}
                                                            >
                                                                <Button variant="outline" size="sm" onClick={fitMapToMarkers} className="h-8">
                                                                    <MapPinned className="h-4 w-4 mr-1" />
                                                                    Fit Map
                                                                </Button>
                                                            </motion.div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Fit map to visible markers</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            className="flex flex-col gap-3"
                                            initial="hidden"
                                            animate="visible"
                                            variants={fadeInVariants}
                                        >
                                            <motion.div 
                                                className="relative"
                                                whileHover={{ scale: 1.01 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <motion.div
                                                    animate={{ 
                                                        x: [0, -3, 3, 0], 
                                                        opacity: [0.7, 1, 0.7] 
                                                    }}
                                                    transition={{ 
                                                        duration: 3,
                                                        repeat: Infinity,
                                                        repeatType: "mirror" 
                                                    }}
                                                    className="absolute left-2 -translate-y-1/2 top-1/4"
                                                >
                                                    <Search className="h-4 w-4 text-primary" />
                                                </motion.div>
                                                <Input
                                                    placeholder="Search sites..."
                                                    value={legendQuery}
                                                    onChange={(e) => setLegendQuery(e.target.value)}
                                                    className="pl-8 pr-8 transition-all duration-200 focus:ring-2 focus:ring-primary/30"
                                                />
                                                {legendQuery && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0 }}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="absolute right-1 top-1/2 -translate-y-1/2"
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 w-6 p-0"
                                                            onClick={() => setLegendQuery("")}
                                                        >
                                                            <X className="h-4 w-4" />
                                                            <span className="sr-only">Clear search</span>
                                                        </Button>
                                                    </motion.div>
                                                )}
                                            </motion.div>

                                            <motion.div 
                                                className="flex flex-wrap gap-2"
                                                variants={{
                                                    hidden: {},
                                                    visible: {
                                                        transition: {
                                                            staggerChildren: 0.08
                                                        }
                                                    }
                                                }}
                                            >
                                                <motion.div
                                                    variants={badgeVariants}
                                                    whileHover="hover"
                                                    className="cursor-pointer"
                                                >
                                                    <Badge variant="outline" className="flex items-center gap-1">
                                                        <motion.div
                                                            animate={{ 
                                                                rotate: [0, 180, 0] 
                                                            }}
                                                            transition={{ 
                                                                duration: 4,
                                                                repeat: Infinity,
                                                                repeatDelay: 5
                                                            }}
                                                        >
                                                            <Filter className="h-3 w-3" />
                                                        </motion.div>
                                                        Filters
                                                        {(activeFilters.length > 0 || legendQuery) && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                whileHover={{ scale: 1.2 }}
                                                                whileTap={{ scale: 0.9 }}
                                                            >
                                                                <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={clearFilters}>
                                                                    <X className="h-3 w-3" />
                                                                    <span className="sr-only">Clear filters</span>
                                                                </Button>
                                                            </motion.div>
                                                        )}
                                                    </Badge>
                                                </motion.div>

                                                {availableMarkerTypes.map((type, index) => (
                                                    <motion.div
                                                        key={type}
                                                        variants={badgeVariants}
                                                        whileHover="hover"
                                                        whileTap="tap"
                                                        className="cursor-pointer"
                                                        custom={index}
                                                        animate={activeFilters.includes(type) ? { y: [0, -4, 0] } : {}}
                                                        transition={activeFilters.includes(type) ? 
                                                            { duration: 0.5, delay: index * 0.1 } : {}}
                                                    >
                                                        <Badge
                                                            variant={activeFilters.includes(type) ? "default" : "outline"}
                                                            className="transition-colors duration-300"
                                                            onClick={() => toggleFilter(type)}
                                                            style={{
                                                                backgroundColor: activeFilters.includes(type)
                                                                    ? getColorForMarkerType(type)
                                                                    : "transparent",
                                                                borderColor: getColorForMarkerType(type),
                                                                color: activeFilters.includes(type) ? "white" : getColorForMarkerType(type),
                                                            }}
                                                        >
                                                            <motion.div
                                                                animate={activeFilters.includes(type) ? 
                                                                    { rotate: [0, 10, -10, 0] } : {}}
                                                                transition={{ 
                                                                    duration: 0.5,
                                                                    repeat: activeFilters.includes(type) ? 1 : 0
                                                                }}
                                                                className="mr-1"
                                                            >
                                                                {React.createElement(markerMapping[type]?.icon || Rocket, {
                                                                    className: "h-3 w-3",
                                                                })}
                                                            </motion.div>
                                                            {markerMapping[type]?.label || type}
                                                        </Badge>
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        </motion.div>
                                    </SidebarHeader>

                                    <SidebarContent className="p-0 w-full flex flex-col">
                                        <SidebarGroup className="w-full flex-none">
                                            <SidebarGroupContent className="w-full">
                                                <SidebarMenu className="w-full">
                                                    {filteredLegendSites.length === 0 ? (
                                                        <motion.div
                                                            className="flex flex-col items-center justify-center p-8 text-center"
                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ 
                                                                type: "spring",
                                                                stiffness: 300,
                                                                damping: 25
                                                            }}
                                                        >
                                                            <motion.div
                                                                animate={{ 
                                                                    y: [0, -10, 0],
                                                                    opacity: [0.7, 1, 0.7]
                                                                }}
                                                                transition={{ 
                                                                    duration: 2.5,
                                                                    repeat: Infinity,
                                                                    repeatType: "reverse"
                                                                }}
                                                            >
                                                                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                                                            </motion.div>
                                                            <motion.h3 
                                                                className="text-lg font-medium"
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                transition={{ delay: 0.3 }}
                                                            >
                                                                No sites found
                                                            </motion.h3>
                                                            <motion.p 
                                                                className="text-sm text-muted-foreground mt-1"
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                transition={{ delay: 0.5 }}
                                                            >
                                                                Try adjusting your search or filters
                                                            </motion.p>
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: 0.7 }}
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                            >
                                                                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                                                                    Clear filters
                                                                </Button>
                                                            </motion.div>
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            className="divide-y w-full overflow-auto h-[calc(100vh-230px)]"
                                                            initial="hidden"
                                                            animate="visible"
                                                            variants={{
                                                                hidden: {},
                                                                visible: {
                                                                    transition: {
                                                                        staggerChildren: 0.05,
                                                                    },
                                                                },
                                                            }}
                                                        >
                                                            <AnimatePresence>
                                                                {filteredLegendSites.map((site, index) => {
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
                                                                                <motion.div
                                                                                    className={cn(
                                                                                        "flex items-center w-full p-3",
                                                                                        isVisible ? "bg-primary/5" : "bg-transparent",
                                                                                        "hover:bg-primary/10 transition-colors"
                                                                                    )}
                                                                                    initial={{ opacity: 0, x: -20 }}
                                                                                    animate={{ opacity: 1, x: 0 }}
                                                                                    transition={{ 
                                                                                        type: "spring",
                                                                                        stiffness: 300,
                                                                                        damping: 25,
                                                                                        delay: index * 0.05
                                                                                    }}
                                                                                    whileHover={{ 
                                                                                        x: 3,
                                                                                        backgroundColor: isVisible ? "rgba(var(--primary), 0.1)" : "rgba(var(--primary), 0.05)"
                                                                                    }}
                                                                                >
                                                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                                        <motion.div
                                                                                            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                                                                                            style={{ backgroundColor: `${getColorForMarkerType(site.markerType)}20` }}
                                                                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                                                                            animate={isVisible ? 
                                                                                                { boxShadow: ['0 0 0 rgba(0,0,0,0)', '0 0 4px rgba(var(--primary), 0.4)', '0 0 0 rgba(0,0,0,0)'] } : {}}
                                                                                            transition={{
                                                                                                boxShadow: {
                                                                                                    repeat: Infinity,
                                                                                                    repeatDelay: 1,
                                                                                                    duration: 1.5
                                                                                                }
                                                                                            }}
                                                                                        >
                                                                                            <motion.div
                                                                                                animate={isVisible ? 
                                                                                                    { scale: [1, 1.2, 1], rotate: [0, 10, 0] } : {}}
                                                                                                transition={{ 
                                                                                                    duration: 1.5,
                                                                                                    repeat: isVisible ? Infinity : 0,
                                                                                                    repeatDelay: 3
                                                                                                }}
                                                                                            >
                                                                                                <IconComponent
                                                                                                    className="w-4 h-4"
                                                                                                    style={{ color: getColorForMarkerType(site.markerType) }}
                                                                                                />
                                                                                            </motion.div>
                                                                                        </motion.div>

                                                                                        <motion.div 
                                                                                            className="flex-1 min-w-0"
                                                                                            initial={{ opacity: 0 }}
                                                                                            animate={{ opacity: 1 }}
                                                                                            transition={{ delay: 0.1 }}
                                                                                        >
                                                                                            <div className="flex items-center">
                                                                                                <motion.h4 
                                                                                                    className="text-sm font-medium truncate mr-1"
                                                                                                    whileHover={{ color: getColorForMarkerType(site.markerType) }}
                                                                                                    transition={{ duration: 0.2 }}
                                                                                                >
                                                                                                    {site.name}
                                                                                                </motion.h4>
                                                                                                <motion.div
                                                                                                    whileHover={{ scale: 1.1 }}
                                                                                                    whileTap={{ scale: 0.95 }}
                                                                                                >
                                                                                                    <Badge
                                                                                                        variant="outline"
                                                                                                        className="text-xs transition-all duration-200"
                                                                                                        style={{
                                                                                                            borderColor: getColorForMarkerType(site.markerType),
                                                                                                            color: getColorForMarkerType(site.markerType),
                                                                                                        }}
                                                                                                    >
                                                                                                        {markerMapping[site.markerType]?.label || site.markerType}
                                                                                                    </Badge>
                                                                                                </motion.div>
                                                                                            </div>
                                                                                            <motion.p 
                                                                                                className="text-xs text-muted-foreground truncate"
                                                                                                initial={{ opacity: 0 }}
                                                                                                animate={{ opacity: 1 }}
                                                                                                transition={{ delay: 0.2 }}
                                                                                            >
                                                                                                {site.description}
                                                                                            </motion.p>
                                                                                        </motion.div>
                                                                                    </div>

                                                                                    <div className="flex items-center gap-2 ml-2">
                                                                                        <Tooltip>
                                                                                            <TooltipTrigger asChild>
                                                                                                <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                                                                                                    <Button
                                                                                                        variant="ghost"
                                                                                                        size="icon"
                                                                                                        className="h-8 w-8"
                                                                                                        onClick={(e) => {
                                                                                                            e.stopPropagation()
                                                                                                            toggleSiteVisibility(site._id)
                                                                                                        }}
                                                                                                    >
                                                                                                        <motion.div
                                                                                                            animate={isVisible ? 
                                                                                                                { rotate: [0, 10, 0], scale: [1, 1.1, 1] } : {}}
                                                                                                            transition={{ 
                                                                                                                duration: 0.3,
                                                                                                                repeat: isVisible ? 0 : 0
                                                                                                            }}
                                                                                                        >
                                                                                                            {isVisible ? (
                                                                                                                <Eye className="h-4 w-4" />
                                                                                                            ) : (
                                                                                                                <EyeOff className="h-4 w-4" />
                                                                                                            )}
                                                                                                        </motion.div>
                                                                                                    </Button>
                                                                                                </motion.div>
                                                                                            </TooltipTrigger>
                                                                                            <TooltipContent>
                                                                                                {isVisible ? "Hide from map" : "Show on map"}
                                                                                            </TooltipContent>
                                                                                        </Tooltip>

                                                                                        <Tooltip>
                                                                                            <TooltipTrigger asChild>
                                                                                                <motion.div 
                                                                                                    whileHover={{ scale: 1.2, y: -2 }} 
                                                                                                    whileTap={{ scale: 0.9 }}
                                                                                                >
                                                                                                    <Button
                                                                                                        variant="ghost"
                                                                                                        size="icon"
                                                                                                        className="h-8 w-8"
                                                                                                        onClick={(e) => {
                                                                                                            e.stopPropagation()
                                                                                                            centerMapOnSite(site)
                                                                                                        }}
                                                                                                    >
                                                                                                        <motion.div
                                                                                                            whileHover={{ 
                                                                                                                y: [0, -3, 0],
                                                                                                                transition: {
                                                                                                                    duration: 0.5,
                                                                                                                    repeat: Infinity
                                                                                                                }
                                                                                                            }}
                                                                                                        >
                                                                                                            <MapPinned className="h-4 w-4" />
                                                                                                        </motion.div>
                                                                                                    </Button>
                                                                                                </motion.div>
                                                                                            </TooltipTrigger>
                                                                                            <TooltipContent>Center map on this site</TooltipContent>
                                                                                        </Tooltip>

                                                                                        <CollapsibleTrigger asChild>
                                                                                            <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                                                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                                                    <motion.div
                                                                                                        animate={isExpanded ? 
                                                                                                            { rotate: 180 } : { rotate: 0 }}
                                                                                                        transition={{ duration: 0.3 }}
                                                                                                    >
                                                                                                        <ChevronDown className="h-4 w-4" />
                                                                                                    </motion.div>
                                                                                                </Button>
                                                                                            </motion.div>
                                                                                        </CollapsibleTrigger>
                                                                                    </div>
                                                                                </motion.div>

                                                                                <CollapsibleContent>
                                                                                    <motion.div
                                                                                        className="p-3 pt-0 pl-14 bg-muted/30"
                                                                                        initial={{ opacity: 0, height: 0 }}
                                                                                        animate={{ opacity: 1, height: "auto" }}
                                                                                        exit={{ opacity: 0, height: 0 }}
                                                                                        transition={{
                                                                                            opacity: { duration: 0.2 },
                                                                                            height: { 
                                                                                                type: "spring",
                                                                                                stiffness: 300,
                                                                                                damping: 30
                                                                                            }
                                                                                        }}
                                                                                    >
                                                                                        <motion.div
                                                                                            className="space-y-3"
                                                                                            initial="hidden"
                                                                                            animate="visible"
                                                                                            variants={{
                                                                                                hidden: {},
                                                                                                visible: {
                                                                                                    transition: {
                                                                                                        staggerChildren: 0.1
                                                                                                    }
                                                                                                }
                                                                                            }}
                                                                                        >
                                                                                            <motion.div 
                                                                                                className="flex items-start gap-2"
                                                                                                variants={fadeInVariants}
                                                                                                whileHover={{ x: 3 }}
                                                                                            >
                                                                                                <motion.div
                                                                                                    whileHover={{ 
                                                                                                        rotate: [0, 10, -10, 0],
                                                                                                        transition: {
                                                                                                            duration: 0.5,
                                                                                                            repeat: Infinity
                                                                                                        }
                                                                                                    }}
                                                                                                >
                                                                                                    <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
                                                                                                </motion.div>
                                                                                                <motion.div className="flex-1" variants={fadeInVariants}>
                                                                                                    <h5 className="text-xs font-medium">Description</h5>
                                                                                                    <p className="text-sm">{site.description}</p>
                                                                                                </motion.div>
                                                                                            </motion.div>

                                                                                            <motion.div 
                                                                                                className="flex items-start gap-2"
                                                                                                variants={fadeInVariants}
                                                                                                whileHover={{ x: 3 }}
                                                                                            >
                                                                                                <motion.div
                                                                                                    animate={{
                                                                                                        rotate: [0, 360],
                                                                                                    }}
                                                                                                    transition={{
                                                                                                        duration: 20,
                                                                                                        repeat: Infinity,
                                                                                                        ease: "linear",
                                                                                                    }}
                                                                                                >
                                                                                                    <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                                                                                                </motion.div>
                                                                                                <motion.div className="flex-1" variants={fadeInVariants}>
                                                                                                    <h5 className="text-xs font-medium">Open Hours</h5>
                                                                                                    <p className="text-sm">{site.openHours}</p>
                                                                                                </motion.div>
                                                                                            </motion.div>

                                                                                            <motion.div 
                                                                                                className="flex items-start gap-2"
                                                                                                variants={fadeInVariants}
                                                                                                whileHover={{ x: 3 }}
                                                                                            >
                                                                                                <motion.div
                                                                                                    animate={isVisible ? {
                                                                                                        y: [0, -3, 0],
                                                                                                    } : {}}
                                                                                                    transition={{
                                                                                                        duration: 1.5,
                                                                                                        repeat: isVisible ? Infinity : 0,
                                                                                                        repeatDelay: 1,
                                                                                                    }}
                                                                                                >
                                                                                                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                                                                                                </motion.div>
                                                                                                <motion.div className="flex-1" variants={fadeInVariants}>
                                                                                                    <h5 className="text-xs font-medium">Status</h5>
                                                                                                    <div className="flex items-center gap-1 mt-1">
                                                                                                        {isVisible ? (
                                                                                                            <>
                                                                                                                <motion.div
                                                                                                                    animate={{
                                                                                                                        scale: [1, 1.2, 1],
                                                                                                                    }}
                                                                                                                    transition={{
                                                                                                                        duration: 1.5,
                                                                                                                        repeat: Infinity,
                                                                                                                        repeatType: "mirror"
                                                                                                                    }}
                                                                                                                >
                                                                                                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                                                                                                </motion.div>
                                                                                                                <motion.span 
                                                                                                                    className="text-sm text-green-600"
                                                                                                                    animate={{ 
                                                                                                                        color: ["#059669", "#10b981", "#059669"],
                                                                                                                    }}
                                                                                                                    transition={{ 
                                                                                                                        duration: 3,
                                                                                                                        repeat: Infinity,
                                                                                                                    }}
                                                                                                                >
                                                                                                                    Visible on map
                                                                                                                </motion.span>
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
                                                                                                </motion.div>
                                                                                            </motion.div>
                                                                                        </motion.div>
                                                                                    </motion.div>
                                                                                </CollapsibleContent>
                                                                            </SidebarMenuItem>
                                                                        </Collapsible>
                                                                    )
                                                                })}
                                                            </AnimatePresence>
                                                        </motion.div>
                                                    )}
                                                </SidebarMenu>
                                            </SidebarGroupContent>
                                        </SidebarGroup>
                                    </SidebarContent>

                                    <SidebarFooter className="p-4 border-t w-full">
                                        <motion.div
                                            className="flex items-center justify-between"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 500,
                                                damping: 30,
                                                delay: 0.6
                                            }}
                                        >
                                            <motion.div 
                                                className="text-sm text-muted-foreground"
                                                animate={{ 
                                                    fontWeight: filteredLegendSites.length > 0 ? 
                                                        ["normal", "bold", "normal"] : "normal" 
                                                }}
                                                transition={{ 
                                                    duration: 1.5,
                                                    repeat: filteredLegendSites.length > 0 ? 1 : 0,
                                                    repeatDelay: 5
                                                }}
                                            >
                                                {filteredLegendSites.length} sites found
                                            </motion.div>
                                            <motion.div 
                                                className="text-sm"
                                                whileHover={{ scale: 1.05 }}
                                                animate={{ 
                                                    color: visibleSiteIds.length > 0 ? 
                                                        ["oklch(var(--foreground))", "oklch(var(--primary))", "oklch(var(--foreground))"] : "oklch(var(--foreground))" 
                                                }}
                                                transition={{ 
                                                    duration: 1.5,
                                                    repeat: visibleSiteIds.length > 0 ? 1 : 0,
                                                    repeatDelay: 5
                                                }}
                                            >
                                                {visibleSiteIds.length} visible on map
                                            </motion.div>
                                        </motion.div>
                                    </SidebarFooter>
                                </Sidebar>
                            </SidebarProvider>
                        </motion.div>
                    </>
                )}
            </motion.div>
        </motion.div>
    )
}
