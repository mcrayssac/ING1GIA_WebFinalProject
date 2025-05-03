"use client"

import { useEffect, useRef, useState } from "react"
import * as Cesium from "cesium"
import * as satellite from "satellite.js"
import { Viewer, Entity } from "resium"
import { Color, ClockRange, ClockStep, UrlTemplateImageryProvider } from "cesium"
import { motion, AnimatePresence } from "framer-motion"
import {
    Rocket,
    Satellite,
    Globe,
    Info,
    Eye,
    EyeOff,
    ChevronLeft,
    ChevronRight,
    Search,
    X,
    Layers,
    Compass,
    Maximize,
    Minimize,
    RotateCcw,
    Orbit,
    Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { useToastAlert } from "@/contexts/ToastContext"

// Animation variants
const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.4 }
    }
}

const slideInVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 30
        }
    }
}

const slideFromTopVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 30
        }
    }
}

const staggerContainerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.07,
            delayChildren: 0.2
        }
    }
}

const pulseVariants = {
    initial: { scale: 1 },
    pulse: {
        scale: [1, 1.05, 1],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            repeatType: "loop"
        }
    }
}

const iconAnimationVariants = {
    initial: { rotate: 0 },
    hover: {
        rotate: [0, 15, -15, 0],
        transition: {
            duration: 0.6,
            ease: "easeInOut"
        }
    },
    tap: { 
        scale: 0.9, 
        transition: { 
            type: "spring", 
            stiffness: 400 
        } 
    },
    rotating: {
        rotate: 360,
        transition: {
            duration: 8,
            repeat: Infinity,
            ease: "linear"
        }
    }
}

const bounceVariants = {
    initial: { y: 0 },
    bounce: {
        y: [0, -10, 0],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            repeatType: "loop"
        }
    }
}

// Helper: Load an SVG from a URL, override fill, width, and height, and return a data URL
async function loadAndColorIcon(url, color, targetWidth, targetHeight) {
    const response = await fetch(url)
    let svgText = await response.text()

    // Replace all fill attributes (case-insensitive) with the provided color
    svgText = svgText.replace(/fill="[^"]*"/gi, `fill="${color}"`)
    
    // Replace width and height attributes if provided
    if (targetWidth) {
        svgText = svgText.replace(/width="[^"]*"/i, `width="${targetWidth}px"`)
    }
    if (targetHeight) {
        svgText = svgText.replace(/height="[^"]*"/i, `height="${targetHeight}px"`)
    }
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgText)
}

export default function SatellitesPage() {
    const { toastError } = useToastAlert()
    const [tleData, setTleData] = useState(null)
    const [issIcon, setIssIcon] = useState(null)
    const [starlinkIcon, setStarlinkIcon] = useState(null)
    const [cesiumLoaded, setCesiumLoaded] = useState(false)
    const [loading, setLoading] = useState(true)
    const [loadingProgress, setLoadingProgress] = useState(0)
    const [searchQuery, setSearchQuery] = useState("")
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [selectedSatellite, setSelectedSatellite] = useState(null)
    const [timeMultiplier, setTimeMultiplier] = useState(1)
    const [showOrbits, setShowOrbits] = useState(true)
    const [showLabels, setShowLabels] = useState(false)
    const [fullscreen, setFullscreen] = useState(false)
    const [activeTab, setActiveTab] = useState("satellites")

    // State for toggling ISS display
    const [displayISS, setDisplayISS] = useState(true)
    
    // State for toggling individual Starlink satellites
    const [displayStarlinkMap, setDisplayStarlinkMap] = useState({})

    const viewerRef = useRef(null)
    const containerRef = useRef(null)
    const issSatrecRef = useRef(null)

    // For multiple Starlink satellites, use arrays of refs
    const starlinkSatrecRefs = useRef([])
    const starlinkSampledPositions = useRef([])

    // Keep the full array of Starlink satellite data from the backend
    const [starlinkSatellites, setStarlinkSatellites] = useState([])

    // Use SampledPositionProperty for ISS
    const issSampledPosition = useRef(new Cesium.SampledPositionProperty())

    // Time window for full trajectory (2 hours: 1 hour before and 1 hour after now)
    const windowSeconds = 7200
    const sampleInterval = 30 // seconds

    // Cesium Ion access token
    Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN

    // Simulate loading progress
    useEffect(() => {
        let progress = 0
        const interval = setInterval(() => {
            progress += Math.random() * 10
            if (progress > 100) {
                progress = 100
                clearInterval(interval)
            }
            setLoadingProgress(Math.floor(progress))
        }, 200)

        return () => clearInterval(interval)
    }, [])

    // Load TLE data from backend
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/satellites`)
            .then((res) => res.json())
            .then((data) => {
                setTleData(data)

                // Process ISS TLE
                if (data.iss && data.iss.tle1 && data.iss.tle2) {
                    issSatrecRef.current = satellite.twoline2satrec(data.iss.tle1, data.iss.tle2)
                    preSampleTrajectory(issSatrecRef.current, issSampledPosition.current)
                }

                // Process Starlink TLE array
                if (data.starlink && Array.isArray(data.starlink)) {
                    setStarlinkSatellites(data.starlink)

                    // Initialize refs arrays
                    starlinkSatrecRefs.current = data.starlink.map((item) => satellite.twoline2satrec(item.tle1, item.tle2))
                    starlinkSampledPositions.current = data.starlink.map(() => new Cesium.SampledPositionProperty())

                    // Pre-sample each Starlink satellite trajectory
                    data.starlink.forEach((_, i) => {
                        preSampleTrajectory(starlinkSatrecRefs.current[i], starlinkSampledPositions.current[i])
                    })

                    // By default, only show the first Starlink satellite
                    const initialDisplay = {}
                    data.starlink.forEach((_, i) => {
                        initialDisplay[i] = i === 0
                    })
                    setDisplayStarlinkMap(initialDisplay)
                }
                setLoading(false)
            })
            .catch((err) => {
                console.error("Failed to load TLE data:", err)
                toastError("Failed to load TLE data", { description: err.message })
                setLoading(false)
            })
    }, [])

    // Load SVG icons and apply custom color/resize
    useEffect(() => {
        async function loadIcons() {
            try {
                const [issDataUrl, starlinkDataUrl] = await Promise.all([
                    loadAndColorIcon("/icons/iss.svg", "#FFA500", 40, 40),
                    loadAndColorIcon("/icons/satellite.svg", "#00FFFF", 40, 40),
                ])
                setIssIcon(issDataUrl)
                setStarlinkIcon(starlinkDataUrl)
            } catch (error) {
                console.error("Error loading icons:", error)
            }
        }
        loadIcons()
    }, [])

    // Pre-sample trajectory over a 2-hour window for a given satellite
    const preSampleTrajectory = (satrec, sampledPosition) => {
        const now = new Date()
        const startTime = new Date(now.getTime() - (windowSeconds / 2) * 1000)
        const endTime = new Date(now.getTime() + (windowSeconds / 2) * 1000)

        sampledPosition._propertySamples = {}
        for (let t = startTime.getTime(); t <= endTime.getTime(); t += sampleInterval * 1000) {
            const sampleTime = new Date(t)
            const posVel = satellite.propagate(satrec, sampleTime)
            if (posVel.position) {
                const gmst = satellite.gstime(sampleTime)
                const positionEcf = satellite.eciToEcf(posVel.position, gmst)
                const cartesian = Cesium.Cartesian3.fromElements(
                    positionEcf.x * 1000,
                    positionEcf.y * 1000,
                    positionEcf.z * 1000,
                )
                const cesiumTime = Cesium.JulianDate.fromDate(sampleTime)
                sampledPosition.addSample(cesiumTime, cartesian)
            }
        }
    }

    // Update the current sample every second to keep the positions in sync
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date()
            if (issSatrecRef.current) {
                updateCurrentSample(issSatrecRef.current, issSampledPosition.current, now)
            }
            // Update each Starlink satellite sample
            if (starlinkSatrecRefs.current.length) {
                starlinkSatrecRefs.current.forEach((satrec, i) => {
                    updateCurrentSample(satrec, starlinkSampledPositions.current[i], now)
                })
            }
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    const updateCurrentSample = (satrec, sampledPosition, now) => {
        const posVel = satellite.propagate(satrec, now)
        if (posVel.position) {
            const gmst = satellite.gstime(now)
            const positionEcf = satellite.eciToEcf(posVel.position, gmst)
            const cartesian = Cesium.Cartesian3.fromElements(positionEcf.x * 1000, positionEcf.y * 1000, positionEcf.z * 1000)
            const cesiumTime = Cesium.JulianDate.now()
            sampledPosition.addSample(cesiumTime, cartesian)
        }
    }

    // Helper function for formatting satellite info
    function formatSatDescription(name, tle1, tle2) {
        if (!tle1 || !tle2) return ""
        const noradId = tle1.substring(2, 7).trim()
        const inclination = Number.parseFloat(tle2.substring(8, 16)).toFixed(2)
        const eccentricity = (Number.parseInt(tle2.substring(26, 33), 10) / 1e7).toFixed(7)
        const meanMotion = Number.parseFloat(tle2.substring(52, 63))
        const periodMinutes = meanMotion ? (1440.0 / meanMotion).toFixed(2) : "N/A"
        return {
            name,
            noradId,
            inclination,
            eccentricity,
            periodMinutes,
        }
    }

    // Format ISS satellite info
    const issInfo =
        tleData && tleData.iss ? formatSatDescription(tleData.iss.name, tleData.iss.tle1, tleData.iss.tle2) : null

    // Format Starlink satellite info
    const starlinkInfo =
        tleData && Array.isArray(tleData.starlink)
            ? tleData.starlink.map((item) => formatSatDescription(item.name, item.tle1, item.tle2))
            : []

    // Toggle handler for ISS
    const toggleISS = () => {
        setDisplayISS((prev) => !prev)
    }

    // Toggle handler for individual Starlink satellites
    const toggleStarlink = (index) => {
        setDisplayStarlinkMap((prev) => ({
            ...prev,
            [index]: !prev[index],
        }))
    }

    // Toggle all Starlink satellites
    const toggleAllStarlink = (value) => {
        const newMap = {}
        starlinkSatellites.forEach((_, i) => {
            newMap[i] = value
        })
        setDisplayStarlinkMap(newMap)
    }

    // Use a ref to detect when the Viewer is ready.
    useEffect(() => {
        if (viewerRef.current && viewerRef.current.cesiumElement) {
            const cesiumViewer = viewerRef.current.cesiumElement
            setCesiumLoaded(true)
            const clock = cesiumViewer.clock
            clock.clockStep = ClockStep.SYSTEM_CLOCK_MULTIPLIER
            clock.multiplier = timeMultiplier
            clock.clockRange = ClockRange.UNBOUNDED
            clock.shouldAnimate = true
        }
    }, [viewerRef.current])

    // Update clock multiplier when timeMultiplier state changes
    useEffect(() => {
        if (cesiumLoaded && viewerRef.current && viewerRef.current.cesiumElement) {
            viewerRef.current.cesiumElement.clock.multiplier = timeMultiplier
        }
    }, [timeMultiplier, cesiumLoaded])

    // Center the camera on the user's location if geolocation is available
    useEffect(() => {
        if (cesiumLoaded && viewerRef.current && viewerRef.current.cesiumElement) {
            const camera = viewerRef.current.cesiumElement.camera
            const currentAltitude = camera.positionCartographic.height || 10000000
            const setLocation = (longitude, latitude) => {
                camera.setView({
                    destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, currentAltitude),
                })
            }

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords
                        setLocation(longitude, latitude)
                    },
                    (error) => {
                        setLocation(2.3522, 48.8566) // Fallback to Paris if geolocation fails
                    },
                )
            } else {
                setLocation(2.3522, 48.8566) // Fallback to Paris if geolocation is not supported
            }
        }
    }, [cesiumLoaded])

    // Handle fullscreen toggle
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            if (containerRef.current.requestFullscreen) {
                containerRef.current.requestFullscreen()
                setFullscreen(true)
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen()
                setFullscreen(false)
            }
        }
    }

    // Listen for fullscreen change events
    useEffect(() => {
        const handleFullscreenChange = () => {
            setFullscreen(!!document.fullscreenElement)
        }

        document.addEventListener("fullscreenchange", handleFullscreenChange)
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange)
        }
    }, [])

    // Filter satellites based on search query
    const filteredStarlink = starlinkSatellites.filter((sat) =>
        sat.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    // Focus on a specific satellite
    const focusOnSatellite = (type, index = 0) => {
        if (!cesiumLoaded || !viewerRef.current || !viewerRef.current.cesiumElement) return

        const viewer = viewerRef.current.cesiumElement
        let position

        if (type === "iss") {
            position = issSampledPosition.current.getValue(Cesium.JulianDate.now())
            setSelectedSatellite({ type: "iss", data: issInfo })
        } else if (type === "starlink") {
            position = starlinkSampledPositions.current[index].getValue(Cesium.JulianDate.now())
            setSelectedSatellite({ type: "starlink", index, data: starlinkInfo[index] })
        }

        if (position) {
            const distance = 2000000; // 2 million meters (2,000 km) from the satellite
            const boundingSphere = new Cesium.BoundingSphere(position, distance)
            viewer.camera.flyToBoundingSphere(boundingSphere, {
                duration: 2
            })
        }
    }

    // Reset camera view
    const resetView = () => {
        if (!cesiumLoaded || !viewerRef.current || !viewerRef.current.cesiumElement) return

        const viewer = viewerRef.current.cesiumElement
        viewer.camera.flyHome()
    }

    // Handle tab change
    const handleTabChange = (value) => {
        setActiveTab(value)
    }

    return (
        <TooltipProvider>
            <div ref={containerRef} className={`relative flex h-100 ${fullscreen && "w-screen"}`}>
                {/* Loading overlay */}
                {loading && (
                    <motion.div
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center"
                        initial="hidden"
                        animate="visible"
                        variants={fadeInVariants}
                    >
                        <motion.div
                            className="w-full max-w-md flex flex-col items-center gap-4"
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainerVariants}
                        >
                            <motion.div variants={pulseVariants}>
                                <Globe className="h-16 w-16 animate-pulse text-primary" />
                            </motion.div>
                            <motion.h2 className="text-2xl font-bold" variants={slideFromTopVariants}>
                                Loading Satellite Data
                            </motion.h2>
                            <motion.div className="w-full" variants={slideInVariants}>
                                <Progress value={loadingProgress} className="w-full" />
                            </motion.div>
                            <motion.p className="text-muted-foreground" variants={slideInVariants}>
                                Fetching orbital parameters...
                            </motion.p>
                        </motion.div>
                    </motion.div>
                )}

                {/* Sidebar */}
                <motion.div
                    className={`border-r transition-all duration-300 flex flex-col ${sidebarCollapsed ? "w-16" : "w-80"
                        } ${fullscreen ? "h-screen" : "h-[800px]"}`}
                    initial="hidden"
                    animate="visible"
                    variants={slideInVariants}
                >
                    {/* Sidebar Header */}
                    <div className="p-4 border-b flex items-center justify-between">
                        <div className={`flex items-center gap-2 ${sidebarCollapsed ? "hidden" : "flex"}`}>
                            <Satellite className="h-5 w-5 text-primary" />
                            <h2 className="font-bold text-lg">Satellite Tracker</h2>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className={sidebarCollapsed ? "mx-auto" : ""}
                        >
                            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                        </Button>
                    </div>

                    {/* Sidebar Content */}
                    {!sidebarCollapsed && (
                        <div className="flex-1 overflow-hidden flex flex-col">
                            <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
                                <TabsList className="grid grid-cols-3 mx-4 mt-4">
                                    <TabsTrigger value="satellites">Satellites</TabsTrigger>
                                    <TabsTrigger value="info">Info</TabsTrigger>
                                    <TabsTrigger value="settings">Settings</TabsTrigger>
                                </TabsList>

                                <div className="flex-1 overflow-hidden">
                                    {/* Satellites Tab */}
                                    {activeTab === "satellites" && (
                                        <div className="flex-1 overflow-hidden flex flex-col h-full">
                                            <div className="p-4 space-y-4">
                                                <div className="relative">
                                                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        placeholder="Search satellites..."
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        className="pl-8 pr-8"
                                                    />
                                                    {searchQuery && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                                                            onClick={() => setSearchQuery("")}
                                                        >
                                                            <X className="h-4 w-4" />
                                                            <span className="sr-only">Clear search</span>
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-sm font-medium">International Space Station</h3>
                                                    <div className="flex items-center gap-2">
                                                        <Switch id="iss-toggle" checked={displayISS} onCheckedChange={toggleISS} />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => focusOnSatellite("iss")}
                                                            disabled={!displayISS}
                                                        >
                                                            <Compass className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <Separator />

                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-sm font-medium">Starlink Satellites</h3>
                                                    <div className="flex items-center gap-2">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="outline" size="sm" className="h-8">
                                                                    <Layers className="h-3.5 w-3.5 mr-1.5" />
                                                                    Bulk Actions
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => toggleAllStarlink(true)}>
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    Show All
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => toggleAllStarlink(false)}>
                                                                    <EyeOff className="h-4 w-4 mr-2" />
                                                                    Hide All
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            </div>

                                            <ScrollArea className="flex-1">
                                                <div className="p-4 pt-0 space-y-2">
                                                    {filteredStarlink.map((sat, i) => (
                                                        <motion.div
                                                            key={sat.name}
                                                            className={`flex items-center justify-between p-2 rounded-md ${displayStarlinkMap[i] ? "bg-primary/10" : "hover:bg-muted"
                                                                }`}
                                                            whileHover={{ 
                                                                x: 4, 
                                                                backgroundColor: displayStarlinkMap[i] ? "rgba(var(--primary), 0.15)" : "rgba(var(--muted), 0.7)" 
                                                            }}
                                                            initial="hidden"
                                                            animate="visible"
                                                            variants={slideInVariants}
                                                            custom={i}
                                                            transition={{ delay: i * 0.05 }}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <motion.div 
                                                                    animate={displayStarlinkMap[i] ? "pulse" : "initial"}
                                                                    variants={pulseVariants}
                                                                >
                                                                    <Satellite
                                                                        className={`h-4 w-4 ${displayStarlinkMap[i] ? "text-primary" : "text-muted-foreground"}`}
                                                                    />
                                                                </motion.div>
                                                                <motion.span
                                                                    className="text-sm truncate max-w-[140px]"
                                                                    animate={displayStarlinkMap[i] ? { color: "oklch(var(--primary))" } : {}}
                                                                >
                                                                    {sat.name}
                                                                </motion.span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Switch
                                                                    id={`starlink-${i}`}
                                                                    checked={displayStarlinkMap[i] || false}
                                                                    onCheckedChange={() => toggleStarlink(i)}
                                                                    size="sm"
                                                                />
                                                                <motion.div
                                                                    whileHover="hover"
                                                                    whileTap="tap"
                                                                    variants={iconAnimationVariants}
                                                                >
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7"
                                                                        onClick={() => focusOnSatellite("starlink", i)}
                                                                        disabled={!displayStarlinkMap[i]}
                                                                    >
                                                                        <Compass className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </motion.div>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                    {filteredStarlink.length === 0 && (
                                                        <div className="flex flex-col items-center justify-center py-8 text-center">
                                                            <Search className="h-8 w-8 text-muted-foreground mb-2" />
                                                            <p className="text-sm text-muted-foreground">No satellites found</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                    )}

                                    {/* Info Tab */}
                                    {activeTab === "info" && (
                                        <div className="p-4 h-full overflow-auto">
                                            {selectedSatellite ? (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                                >
                                                    <Card>
                                                        <CardHeader>
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <motion.div
                                                                        animate="rotating"
                                                                        variants={iconAnimationVariants}
                                                                    >
                                                                        {selectedSatellite.type === "iss" ? (
                                                                            <Rocket className="h-5 w-5 text-orange-500" />
                                                                        ) : (
                                                                            <Satellite className="h-5 w-5 text-cyan-500" />
                                                                        )}
                                                                    </motion.div>
                                                                    <CardTitle>{selectedSatellite.data.name}</CardTitle>
                                                                </div>
                                                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                                                    <Badge variant="outline" className="text-accent-foreground">
                                                                        {selectedSatellite.type === "iss" ? "ISS" : "Starlink"}
                                                                    </Badge>
                                                                </motion.div>
                                                            </div>
                                                            <CardDescription>NORAD ID: {selectedSatellite.data.noradId}</CardDescription>
                                                        </CardHeader>
                                                        <CardContent className="space-y-4">
                                                            <motion.div 
                                                                className="grid grid-cols-2 gap-4"
                                                                variants={staggerContainerVariants}
                                                                initial="hidden"
                                                                animate="visible"
                                                            >
                                                                <motion.div className="space-y-1" variants={fadeInVariants}>
                                                                    <p className="text-xs text-muted-foreground">Inclination</p>
                                                                    <p className="text-sm font-medium">{selectedSatellite.data.inclination}°</p>
                                                                </motion.div>
                                                                <motion.div className="space-y-1" variants={fadeInVariants}>
                                                                    <p className="text-xs text-muted-foreground">Orbital Period</p>
                                                                    <p className="text-sm font-medium">{selectedSatellite.data.periodMinutes} minutes</p>
                                                                </motion.div>
                                                                <motion.div className="space-y-1" variants={fadeInVariants}>
                                                                    <p className="text-xs text-muted-foreground">Eccentricity</p>
                                                                    <p className="text-sm font-medium">{selectedSatellite.data.eccentricity}</p>
                                                                </motion.div>
                                                                <motion.div className="space-y-1" variants={fadeInVariants}>
                                                                    <p className="text-xs text-muted-foreground">Status</p>
                                                                    <motion.div
                                                                        animate={{ 
                                                                            scale: [1, 1.05, 1],
                                                                        }}
                                                                        transition={{ 
                                                                            duration: 2, 
                                                                            repeat: Infinity,
                                                                            repeatType: "reverse" 
                                                                        }}
                                                                    >
                                                                        <Badge variant="success" className="bg-green-500">
                                                                            Active
                                                                        </Badge>
                                                                    </motion.div>
                                                                </motion.div>
                                                            </motion.div>
                                                        </CardContent>
                                                        <CardFooter>
                                                            <motion.div
                                                                className="w-full"
                                                                whileHover={{ scale: 1.03 }}
                                                                whileTap={{ scale: 0.97 }}
                                                            >
                                                                <Button
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    className="w-full"
                                                                    onClick={() =>
                                                                        focusOnSatellite(
                                                                            selectedSatellite.type,
                                                                            selectedSatellite.type === "starlink" ? selectedSatellite.index : 0,
                                                                        )
                                                                    }
                                                                >
                                                                    <motion.div 
                                                                        className="mr-2"
                                                                        animate={{ rotate: [0, 360] }} 
                                                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                                                    >
                                                                        <Compass className="h-4 w-4" />
                                                                    </motion.div>
                                                                    Focus Camera
                                                                </Button>
                                                            </motion.div>
                                                        </CardFooter>
                                                    </Card>
                                                </motion.div>
                                            ) : (
                                                <motion.div 
                                                    className="flex flex-col items-center justify-center h-full text-center"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 0.5 }}
                                                >
                                                    <motion.div
                                                        animate={bounceVariants.bounce}
                                                        transition={{ delay: 0.5 }}
                                                    >
                                                        <Info className="h-12 w-12 text-muted-foreground mb-4" />
                                                    </motion.div>
                                                    <motion.h3 
                                                        className="text-lg font-medium"
                                                        initial={{ y: 20, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        transition={{ delay: 0.2 }}
                                                    >
                                                        No Satellite Selected
                                                    </motion.h3>
                                                    <motion.p 
                                                        className="text-sm text-muted-foreground mt-1 max-w-xs"
                                                        initial={{ y: 20, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        transition={{ delay: 0.3 }}
                                                    >
                                                        Click on a satellite in the 3D view or use the focus button in the satellites tab to view
                                                        detailed information.
                                                    </motion.p>
                                                </motion.div>
                                            )}
                                        </div>
                                    )}

                                    {/* Settings Tab */}
                                    {activeTab === "settings" && (
                                        <div className="p-4 space-y-6 h-full overflow-auto">
                                            <motion.div 
                                                className="space-y-2"
                                                initial="hidden"
                                                animate="visible"
                                                variants={fadeInVariants}
                                            >
                                                <h3 className="text-sm font-medium">Time Controls</h3>
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="time-multiplier">Simulation Speed</Label>
                                                    <motion.span 
                                                        className="text-sm"
                                                        animate={{ 
                                                            scale: [1, 1.1, 1], 
                                                            color: timeMultiplier >= 10 ? 
                                                                ["oklch(var(--foreground))", "oklch(var(--primary))", "oklch(var(--foreground))"] : 
                                                                "oklch(var(--foreground))"
                                                        }}
                                                        transition={{ 
                                                            duration: 0.5, 
                                                            repeat: timeMultiplier >= 10 ? 2 : 0,
                                                            repeatDelay: 2
                                                        }}
                                                    >
                                                        {timeMultiplier}x
                                                    </motion.span>
                                                </div>
                                                <motion.div 
                                                    className="flex items-center gap-2"
                                                    variants={staggerContainerVariants}
                                                >
                                                    {[1, 5, 10, 60].map((speed) => (
                                                        <motion.div
                                                            key={speed}
                                                            variants={fadeInVariants}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setTimeMultiplier(speed)}
                                                                className={timeMultiplier === speed ? "bg-primary text-primary-foreground" : ""}
                                                            >
                                                                {speed}x
                                                            </Button>
                                                        </motion.div>
                                                    ))}
                                                </motion.div>
                                            </motion.div>

                                            <Separator />

                                            <motion.div 
                                                className="space-y-3"
                                                initial="hidden"
                                                animate="visible"
                                                variants={fadeInVariants}
                                                transition={{ delay: 0.2 }}
                                            >
                                                <h3 className="text-sm font-medium">Display Options</h3>

                                                <motion.div 
                                                    className="flex items-center justify-between"
                                                    whileHover={{ x: 3, backgroundColor: "rgba(var(--muted), 0.3)" }}
                                                    transition={{ duration: 0.2 }}
                                                    initial={{ backgroundColor: "transparent" }}
                                                    animate={{ backgroundColor: "transparent" }}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <motion.div
                                                            animate={{ rotate: showOrbits ? [0, 360] : 0 }}
                                                            transition={{ 
                                                                duration: 5, 
                                                                repeat: showOrbits ? Infinity : 0,
                                                                ease: "linear" 
                                                            }}
                                                        >
                                                            <Orbit className="h-4 w-4 text-muted-foreground" />
                                                        </motion.div>
                                                        <Label htmlFor="show-orbits">Show Orbital Paths</Label>
                                                    </div>
                                                    <Switch id="show-orbits" checked={showOrbits} onCheckedChange={setShowOrbits} />
                                                </motion.div>

                                                <motion.div 
                                                    className="flex items-center justify-between"
                                                    whileHover={{ x: 3, backgroundColor: "rgba(var(--muted), 0.3)" }}
                                                    transition={{ duration: 0.2 }}
                                                    initial={{ backgroundColor: "transparent" }}
                                                    animate={{ backgroundColor: "transparent" }}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <motion.div
                                                            animate={showLabels ? {
                                                                scale: [1, 1.2, 1],
                                                                color: ["currentColor", "oklch(var(--primary))", "currentColor"]
                                                            } : {}}
                                                            transition={{ 
                                                                duration: 1.5, 
                                                                repeat: showLabels ? Infinity : 0,
                                                                repeatDelay: 2
                                                            }}
                                                        >
                                                            <Zap className="h-4 w-4 text-muted-foreground" />
                                                        </motion.div>
                                                        <Label htmlFor="show-labels">Show Satellite Labels</Label>
                                                    </div>
                                                    <Switch id="show-labels" checked={showLabels} onCheckedChange={setShowLabels} />
                                                </motion.div>
                                            </motion.div>

                                            <Separator />

                                            <motion.div 
                                                className="space-y-3"
                                                initial="hidden"
                                                animate="visible"
                                                variants={fadeInVariants}
                                                transition={{ delay: 0.4 }}
                                            >
                                                <h3 className="text-sm font-medium">Camera Controls</h3>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <motion.div
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <Button variant="outline" size="sm" onClick={resetView} className="w-full">
                                                            <motion.div 
                                                                className="mr-2"
                                                                whileHover={{ rotate: 360 }}
                                                                transition={{ duration: 0.5 }}
                                                            >
                                                                <RotateCcw className="h-4 w-4" />
                                                            </motion.div>
                                                            Reset View
                                                        </Button>
                                                    </motion.div>
                                                    
                                                    <motion.div
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <Button variant="outline" size="sm" onClick={toggleFullscreen} className="w-full">
                                                            {fullscreen ? (
                                                                <>
                                                                    <motion.div 
                                                                        className="mr-2"
                                                                        animate={{ scale: [1, 0.8, 1] }}
                                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                                    >
                                                                        <Minimize className="h-4 w-4" />
                                                                    </motion.div>
                                                                    Exit
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <motion.div 
                                                                        className="mr-2"
                                                                        animate={{ scale: [1, 1.2, 1] }}
                                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                                    >
                                                                        <Maximize className="h-4 w-4" />
                                                                    </motion.div>
                                                                    Fullscreen
                                                                </>
                                                            )}
                                                        </Button>
                                                    </motion.div>
                                                </div>
                                            </motion.div>
                                        </div>
                                    )}
                                </div>
                            </Tabs>
                        </div>
                    )}
                </motion.div>

                {/* Main Content - Cesium Viewer */}
                <div className={`relative flex-1 ${fullscreen ? "h-screen" : "h-[800px]"}`}>
                    {/* Loading UI */}
                    {!cesiumLoaded && (
                        <motion.div
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center"
                            initial="hidden"
                            animate="visible"
                            variants={fadeInVariants}
                        >
                            <motion.div
                                className="flex flex-col items-center gap-2"
                                initial="hidden"
                                animate="visible"
                                variants={staggerContainerVariants}
                            >
                                <motion.div variants={iconAnimationVariants} animate="rotating">
                                    <Globe className="h-12 w-12 text-primary" />
                                </motion.div>
                                <motion.p className="text-lg font-medium" variants={slideFromTopVariants}>
                                    Loading 3D Globe...
                                </motion.p>
                            </motion.div>
                        </motion.div>
                    )}

                    <Viewer
                        ref={viewerRef}
                        className="w-full h-full"
                        imageryProvider={
                            new UrlTemplateImageryProvider({
                                url: "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
                            })
                        }
                        baseLayerPicker={true}
                        timeline={true}
                        animation={true}
                        fullscreenButton={false}
                        homeButton={false}
                        infoBox={true}
                        sceneModePicker={true}
                        selectionIndicator={false}
                        navigationHelpButton={false}
                    >
                        {tleData && (
                            <>
                                {displayISS && (
                                    <Entity
                                        name={tleData.iss.name}
                                        position={issSampledPosition.current}
                                        billboard={{
                                            image: issIcon,
                                            scale: 0.8,
                                            verticalOrigin: Cesium.VerticalOrigin.CENTER,
                                        }}
                                        label={{
                                            text: tleData.iss.name,
                                            font: "14px sans-serif",
                                            fillColor: Cesium.Color.WHITE,
                                            outlineColor: Cesium.Color.BLACK,
                                            outlineWidth: 2,
                                            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                                            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                                            pixelOffset: new Cesium.Cartesian2(0, -30),
                                            show: showLabels,
                                        }}
                                        point={{ pixelSize: 0 }}
                                        path={{
                                            show: showOrbits,
                                            leadTime: windowSeconds / 2,
                                            trailTime: windowSeconds / 2,
                                            width: 2,
                                            material: Color.ORANGE.withAlpha(0.5),
                                        }}
                                        description={issInfo ? JSON.stringify(issInfo) : ""}
                                        onClick={() => setSelectedSatellite({ type: "iss", data: issInfo })}
                                    />
                                )}

                                {/* Render each Starlink entity if toggled on */}
                                {starlinkSatellites.map((sat, i) =>
                                    displayStarlinkMap[i] ? (
                                        <Entity
                                            key={sat.name}
                                            name={sat.name}
                                            position={starlinkSampledPositions.current[i]}
                                            billboard={{
                                                image: starlinkIcon,
                                                scale: 0.5,
                                                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                                            }}
                                            label={{
                                                text: sat.name,
                                                font: "12px sans-serif",
                                                fillColor: Cesium.Color.CYAN,
                                                outlineColor: Cesium.Color.BLACK,
                                                outlineWidth: 2,
                                                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                                                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                                                pixelOffset: new Cesium.Cartesian2(0, -25),
                                                show: showLabels,
                                            }}
                                            point={{ pixelSize: 0 }}
                                            path={{
                                                show: showOrbits,
                                                leadTime: windowSeconds / 2,
                                                trailTime: windowSeconds / 2,
                                                width: 2,
                                                material: Color.CYAN.withAlpha(0.5),
                                            }}
                                            description={starlinkInfo[i] ? JSON.stringify(starlinkInfo[i]) : ""}
                                            onClick={() => setSelectedSatellite({ type: "starlink", index: i, data: starlinkInfo[i] })}
                                        />
                                    ) : null,
                                )}
                            </>
                        )}
                    </Viewer>

                    {/* Floating controls for collapsed sidebar */}
                    {sidebarCollapsed && (
                        <div className="absolute top-4 left-5 z-10 flex flex-col gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="secondary" size="icon" onClick={() => setSidebarCollapsed(false)}>
                                        <Layers className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right">Show Sidebar</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="secondary" size="icon" onClick={resetView}>
                                        <RotateCcw className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right">Reset View</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="secondary" size="icon" onClick={toggleFullscreen}>
                                        {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right">{fullscreen ? "Exit Fullscreen" : "Fullscreen"}</TooltipContent>
                            </Tooltip>
                        </div>
                    )}
                </div>
            </div>
        </TooltipProvider>
    )
}

