"use client"

import React, { useState, useEffect, useRef } from "react"
import { MapsProvider } from "@/components/maps-provider"
import { useParams, useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { renderToStaticMarkup } from "react-dom/server"
import { motion, AnimatePresence } from "framer-motion"
import {
    Rocket,
    Users,
    Clock,
    Info,
    MapPin,
    Building2,
    Cog,
    CheckCircle,
    ArrowLeft,
    Loader2,
    ExternalLink,
    Eye,
    EyeOff,
    Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import NoData from "@/components/no-data"
import { useToastAlert } from "@/contexts/ToastContext"
import { useUser } from "@/contexts/UserContext"

// Prevent SSR for map components
const DynamicMap = dynamic(() => import("@react-google-maps/api").then((mod) => mod.GoogleMap), { ssr: false })

const DynamicMarker = dynamic(() => import("@react-google-maps/api").then((mod) => mod.MarkerF), { ssr: false })

const DynamicPolygon = dynamic(() => import("@react-google-maps/api").then((mod) => mod.PolygonF), { ssr: false })

const markerMapping = {
    launch: { icon: Rocket, color: "oklch(var(--s))", label: "Launch Site" },
    hq: { icon: Building2, color: "oklch(var(--nc))", label: "Headquarters" },
    office: { icon: Building2, color: "green", label: "Office" },
    test: { icon: Cog, color: "purple", label: "Test Facility" },
}

const containerStyle = { width: "100%", height: "400px" }

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.3,
            when: "beforeChildren",
            staggerChildren: 0.1
        },
    },
    exit: { opacity: 0, transition: { duration: 0.2 } }
}

const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 200,
            damping: 20,
            duration: 0.3
        },
    },
    exit: { opacity: 0, y: 10, transition: { duration: 0.2 } }
}

const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { type: "spring", stiffness: 300, damping: 25 },
    },
    hover: {
        scale: 1.02,
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
        transition: { type: "spring", stiffness: 400, damping: 20 },
    },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
}

const infoFieldVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    exit: { opacity: 0, x: -10, transition: { duration: 0.15 } }
}

const listItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i) => ({
        opacity: 1,
        x: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24,
            delay: i * 0.05
        },
    }),
    hover: {
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 20 },
    },
    exit: { opacity: 0, x: -5, transition: { duration: 0.1 } }
}

const slideUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
            duration: 0.5,
            ease: "easeOut"
        }
    }
}

export default function SitePage() {
    const { id } = useParams()
    const { user } = useUser()
    const router = useRouter()
    const { toastError, toastSuccess } = useToastAlert()
    const [site, setSite] = useState(null)
    const [employees, setEmployees] = useState([])
    const [machines, setMachines] = useState([])
    const [loading, setLoading] = useState(true)
    const [effectiveColors, setEffectiveColors] = useState({
        launch: null,
        hq: null,
    })
    const [activeTab, setActiveTab] = useState("overview")
    const [mapLoaded, setMapLoaded] = useState(false)
    const [showAllEmployees, setShowAllEmployees] = useState(false)
    const [showAllMachines, setShowAllMachines] = useState(false)
    const mapRef = useRef(null)

    // Compute effective colors for "launch" and "hq" after mount
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

    // Fetch site data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Proceed with fetch regardless of user status
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sites/${id}`, {
                    method: "GET",
                    credentials: "include",
                })
                const data = await res.json()

                if (!res.ok) {
                    throw new Error(data.message || "Failed to fetch site data")
                }

                setSite(data.site)
                
                // Only set employees and machines data if user is logged in
                if (user) {
                    setEmployees(data.employees || [])
                    setMachines(data.machines || [])
                }

                // Simulate a slight delay for smoother animations
                setTimeout(() => {
                    setLoading(false)
                }, 300)
            } catch (err) {
                toastError(err.message || "Error fetching site data")
                console.error(err)
                setLoading(false)
            }
        }
        fetchData()
    }, [id, user])

    const getColorForMarkerType = (type) => {
        if (type === "launch" || type === "hq") {
            return effectiveColors[type] || markerMapping[type].color
        }
        return markerMapping[type]?.color || "gray"
    }

    const getMarkerIcon = (site) => {
        if (!window.google?.maps) return null
        const mapping = markerMapping[site.markerType] || { icon: Rocket, color: "gray" }
        const color = getColorForMarkerType(site.markerType)
        const svgMarkup = renderToStaticMarkup(<mapping.icon color={color} size={24} />)
        return {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgMarkup)}`,
            scaledSize: new window.google.maps.Size(30, 30),
            anchor: new window.google.maps.Point(15, 30),
        }
    }

    const [userBelongsToSite, setUserBelongsToSite] = useState(false)
    const [isJoining, setIsJoining] = useState(false)

    const handleJoinSite = async () => {
        try {
            setIsJoining(true)
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sites/${id}/join`, {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Failed to join site")
            }

            // Refresh the employee data after joining
            const updatedData = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sites/${id}`, {
                method: "GET",
                credentials: "include",
            })
            const { employees: updatedEmployees } = await updatedData.json()
            setEmployees(updatedEmployees)

            toastSuccess("Successfully joined site!")
        } catch (err) {
            toastError(err.message || "Error joining site")
        } finally {
            setIsJoining(false)
        }
    }

    // Update userBelongsToSite when user or employees change
    useEffect(() => {
        if (user && employees.length > 0) {
            setUserBelongsToSite(employees.some((emp) => emp._id === user?.employeeId))
        } else {
            setUserBelongsToSite(false)
        }
    }, [user, employees])

    const handleMapLoad = (map) => {
        mapRef.current = map
        setMapLoaded(true)
    }

    // Show loading state while user context is initializing
    if (user === undefined || loading) {
        return (
            <motion.div 
                className="container mx-auto px-4 py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex flex-col gap-8">
                    <div className="flex items-start justify-between gap-4 mb-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <Skeleton className="w-8 h-8 rounded-full" />
                                <Skeleton className="h-10 w-48" />
                            </div>
                            <Skeleton className="h-6 w-24" />
                        </div>
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-32" />
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </div>

                    <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <Skeleton className="h-64 w-full rounded-lg" />
                            <Skeleton className="h-64 w-full rounded-lg" />
                        </div>
                        <div className="space-y-6">
                            <Skeleton className="h-64 w-full rounded-lg" />
                            <Skeleton className="h-64 w-full rounded-lg" />
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        )
    }

    if (user === false) {
        return (
            <AnimatePresence mode="wait">
                <motion.div
                    className="flex flex-col items-center justify-center h-[calc(100vh-200px)] p-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <motion.div 
                        className="flex flex-col items-center justify-center p-8 rounded-lg"
                        variants={cardVariants}
                    >
                        <motion.div
                            variants={itemVariants}
                            whileHover={{
                                scale: 1.1,
                                rotate: [0, -5, 5, 0],
                                transition: { duration: 0.5 }
                            }}
                            className="mb-6 text-primary"
                        >
                            <Shield className="h-16 w-16" />
                        </motion.div>
                        <motion.h2
                            className="text-2xl font-bold mb-3"
                            variants={itemVariants}
                        >
                            Login Required
                        </motion.h2>
                        <motion.p
                            className="text-muted-foreground text-center mb-6"
                            variants={itemVariants}
                        >
                            Please sign in to view complete site details and features.
                        </motion.p>
                        
                        <motion.div 
                            className="flex gap-4 mt-2" 
                            variants={itemVariants}
                        >
                            <Button 
                                variant="default" 
                                onClick={() => router.push('/login')}
                                className="flex items-center gap-2"
                            >
                                Log In
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => router.push('/map')}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Map
                            </Button>
                        </motion.div>
                        
                        {site && (
                            <motion.div 
                                className="w-full mt-8 p-4 border rounded-lg bg-background" 
                                variants={itemVariants}
                            >
                                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                    {React.createElement(markerMapping[site.markerType]?.icon || Rocket, {
                                        className: "w-5 h-5",
                                        style: { color: getColorForMarkerType(site.markerType) },
                                    })}
                                    {site.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">{site.description}</p>
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        )
    }

    if (!site) return <NoData message="Site not found" />

    const displayedEmployees = showAllEmployees ? employees : employees.slice(0, 3)
    const displayedMachines = showAllMachines ? machines : machines.slice(0, 3)

    return (
        <AnimatePresence mode="wait">
            <motion.div
                className="container mx-auto px-4 py-8 h-full"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                key="main-container"
            >
                {/* Header Section */}
                <motion.div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-8 p-6 rounded-lg" variants={itemVariants}>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <motion.div
                                whileHover={{ rotate: 15, scale: 1.2 }}
                                transition={{ type: "spring", stiffness: 300, damping: 10 }}
                            >
                                {React.createElement(markerMapping[site.markerType]?.icon || Rocket, {
                                    className: "w-10 h-10",
                                    style: { color: getColorForMarkerType(site.markerType) },
                                })}
                            </motion.div>
                            <h1 className="text-4xl font-black font-mono">{site.name}</h1>
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                            <Badge
                                variant="outline"
                                className="text-sm"
                                style={{
                                    borderColor: getColorForMarkerType(site.markerType),
                                    color: getColorForMarkerType(site.markerType),
                                }}
                            >
                                {markerMapping[site.markerType]?.label || site.markerType}
                            </Badge>
                            <Badge variant="secondary" className="text-sm">
                                {employees.length} Employees
                            </Badge>
                            <Badge variant="secondary" className="text-sm">
                                {machines.length} Machines
                            </Badge>
                        </div>
                        <p className="text-muted-foreground max-w-2xl">{site.description}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0">
                        {user && (
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    variant={userBelongsToSite ? "default" : "outline"}
                                    className="flex items-center gap-2 min-w-[140px] justify-center"
                                    disabled={userBelongsToSite || isJoining}
                                    onClick={handleJoinSite}
                                >
                                    {isJoining ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Joining...
                                        </>
                                    ) : userBelongsToSite ? (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            Member of Site
                                        </>
                                    ) : (
                                        <>
                                            <MapPin className="w-4 h-4" />
                                            Join Site
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        )}

                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button variant="outline" className="flex items-center gap-2" onClick={() => router.push("/map")} data-navigation="true">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Map
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Tabs Navigation */}
                <motion.div variants={itemVariants} className="mb-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
                            <TabsTrigger value="overview" className="flex items-center gap-2">
                                <Info className="h-4 w-4" />
                                <span className="hidden md:inline">Overview</span>
                            </TabsTrigger>
                            <TabsTrigger value="employees" className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span className="hidden md:inline">Employees</span>
                            </TabsTrigger>
                            <TabsTrigger value="machines" className="flex items-center gap-2">
                                <Cog className="h-4 w-4" />
                                <span className="hidden md:inline">Machines</span>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </motion.div>

                {/* Main Content Area */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Overview Tab */}
                        {activeTab === "overview" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Site Info Card */}
                                <motion.div variants={cardVariants} whileHover="hover">
                                    <Card className="h-full">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Info className="w-5 h-5" />
                                                Site Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-1 space-y-4">
                                            <motion.div
                                                className="space-y-4"
                                                initial="hidden"
                                                animate="visible"
                                                variants={{
                                                    visible: {
                                                        transition: {
                                                            staggerChildren: 0.1
                                                        }
                                                    }
                                                }}
                                            >
                                                <motion.div
                                                    className="flex items-start gap-3"
                                                    variants={infoFieldVariants}
                                                >
                                                    <Clock className="w-5 h-5 mt-1 text-muted-foreground" />
                                                    <div>
                                                        <p className="text-sm font-medium">Operating Hours</p>
                                                        <p className="text-sm text-muted-foreground">{site.openHours}</p>
                                                    </div>
                                                </motion.div>

                                                <motion.div
                                                    className="flex items-start gap-3"
                                                    variants={infoFieldVariants}
                                                >
                                                    <MapPin className="w-5 h-5 mt-1 text-muted-foreground" />
                                                    <div>
                                                        <p className="text-sm font-medium">Coordinates</p>
                                                        <p className="text-sm text-muted-foreground">{site.coordinates[0]}, {site.coordinates[1]}</p>
                                                    </div>
                                                </motion.div>

                                                <motion.div
                                                    className="flex items-start gap-3"
                                                    variants={infoFieldVariants}
                                                >
                                                    <MapPin className="w-5 h-5 mt-1 text-muted-foreground" />
                                                    <div>
                                                        <p className="text-sm font-medium">Geometry Points</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {site.geometry.length} boundary points defined
                                                        </p>
                                                    </div>
                                                </motion.div>
                                                <motion.div
                                                    className="flex items-start gap-3"
                                                    variants={infoFieldVariants}
                                                >
                                                    <Building2 className="w-5 h-5 mt-1 text-muted-foreground" />
                                                    <div>
                                                        <p className="text-sm font-medium">Site Type</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {markerMapping[site.markerType]?.label || site.markerType}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            </motion.div>
                                        </CardContent>
                                        <CardFooter>
                                            <Button
                                                variant="secondary"
                                                className="w-full"
                                                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${site.coordinates[0]},${site.coordinates[1]}`, "_blank")}
                                            >
                                                <ExternalLink className="w-4 h-4 mr-2" />
                                                View on Google Maps
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </motion.div>

                                {/* Map Card */}
                                <motion.div variants={cardVariants} whileHover="hover">
                                    <Card className="flex flex-col h-full">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <MapPin className="w-5 h-5" />
                                                Location
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <MapsProvider>
                                                <div className="rounded-lg overflow-hidden">
                                                    <DynamicMap
                                                        mapContainerStyle={containerStyle}
                                                        center={{
                                                            lat: site.coordinates[0],
                                                            lng: site.coordinates[1],
                                                        }}
                                                        zoom={15}
                                                        options={{
                                                            disableDefaultUI: true,
                                                            zoomControl: true,
                                                            scrollwheel: true,
                                                            streetViewControl: false,
                                                            mapTypeControl: false,
                                                        }}
                                                        onLoad={handleMapLoad}
                                                    >
                                                        {mapLoaded && (
                                                            <>
                                                                <DynamicMarker
                                                                    position={{
                                                                        lat: site.coordinates[0],
                                                                        lng: site.coordinates[1],
                                                                    }}
                                                                    icon={getMarkerIcon(site)}
                                                                    animation={window.google?.maps.Animation.DROP}
                                                                />
                                                                {site.geometry && Array.isArray(site.geometry) && (
                                                                    <DynamicPolygon
                                                                        paths={site.geometry.map((pt) =>
                                                                            Array.isArray(pt) ? { lat: pt[0], lng: pt[1] } : pt,
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
                                                            </>
                                                        )}
                                                    </DynamicMap>
                                                </div>
                                            </MapsProvider>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </div>
                        )}

                        {/* Load employees tab content from separate file */}
                        {activeTab === "employees" && (
                            <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="exit">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2">
                                                <Users className="w-5 h-5" />
                                                Employees ({employees.length})
                                            </CardTitle>
                                            {user?.admin && (
                                                <Button variant="secondary" size="sm" onClick={() => router.push("/users")} data-navigation="true">
                                                    Manage Employees
                                                </Button>
                                            )}
                                        </div>
                                        <CardDescription>People working at this site</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {employees.length === 0 ? (
                                            <div className="text-center py-8">
                                                <Users className="w-12 h-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                                                <p className="text-muted-foreground">No employees assigned to this site</p>
                                                {user?.admin && (
                                                    <Button variant="secondary" className="mt-4" onClick={() => router.push("/users")} data-navigation="true">
                                                        Add Employee
                                                    </Button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {displayedEmployees.map((employee, index) => (
                                                        <motion.div
                                                            key={employee._id}
                                                            variants={listItemVariants}
                                                            custom={index}
                                                            initial="hidden"
                                                            animate="visible"
                                                            whileHover="hover"
                                                            exit="exit"
                                                            className="flex items-start gap-3 p-4 rounded-lg border bg-background"
                                                        >
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarFallback className="bg-primary">
                                                                    {employee.employeeId.charAt(0).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium text-primary">{employee.employeeId}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {employee.department} • {employee.position}
                                                                </p>
                                                                <Badge variant="outline" className="mt-1">
                                                                    {employee.contractType}
                                                                </Badge>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>

                                                {employees.length > 3 && (
                                                    <motion.div
                                                        className="flex justify-center mt-4"
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => setShowAllEmployees(!showAllEmployees)}
                                                            className="flex items-center gap-2"
                                                        >
                                                            {showAllEmployees ? (
                                                                <>
                                                                    <EyeOff className="w-4 h-4" />
                                                                    Show Less
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Eye className="w-4 h-4" />
                                                                    Show All {employees.length} Employees
                                                                </>
                                                            )}
                                                        </Button>
                                                    </motion.div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* Machines Tab */}
                        {activeTab === "machines" && (
                            <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="exit">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2">
                                                <Cog className="w-5 h-5" />
                                                Machines ({machines.length})
                                            </CardTitle>
                                            {user?.admin && (
                                                <Button variant="secondary" size="sm" onClick={() => router.push("/machines")} data-navigation="true">
                                                    Manage Machines
                                                </Button>
                                            )}
                                        </div>
                                        <CardDescription>Equipment available at this site</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {machines.length === 0 ? (
                                            <div className="text-center py-8">
                                                <Cog className="w-12 h-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                                                <p className="text-muted-foreground">No machines at this site</p>
                                                {user?.admin && (
                                                    <Button variant="secondary" className="mt-4" onClick={() => router.push("/machinesForm")} data-navigation="true">
                                                        Add Machine
                                                    </Button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {displayedMachines.map((machine, index) => (
                                                        <motion.div
                                                            key={machine._id}
                                                            variants={listItemVariants}
                                                            custom={index}
                                                            initial="hidden"
                                                            animate="visible"
                                                            whileHover="hover"
                                                            exit="exit"
                                                            className="flex items-start gap-3 p-4 rounded-lg border bg-background"
                                                        >
                                                            <Cog className="w-5 h-5 mt-1 text-muted-foreground" />
                                                            <div>
                                                                <p className="text-sm font-medium">{machine.name}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {machine.mainPole} • {machine.subPole}
                                                                </p>
                                                                <div className="flex gap-2 mt-1">
                                                                    <Badge variant="outline">{machine.requiredGrade}</Badge>
                                                                    <Badge variant={machine.status === "available" ? "default" : "destructive"}>
                                                                        {machine.status}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>

                                                {machines.length > 3 && (
                                                    <motion.div
                                                        className="flex justify-center mt-4"
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => setShowAllMachines(!showAllMachines)}
                                                            className="flex items-center gap-2"
                                                        >
                                                            {showAllMachines ? (
                                                                <>
                                                                    <EyeOff className="w-4 h-4" />
                                                                    Show Less
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Eye className="w-4 h-4" />
                                                                    Show All {machines.length} Machines
                                                                </>
                                                            )}
                                                        </Button>
                                                    </motion.div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    )
}
