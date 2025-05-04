"use client"

import { use, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
    Cpu,
    ArrowLeft,
    RefreshCw,
    Info,
    BarChart2,
    Layers,
    Maximize,
    Minimize,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useUser } from "@/contexts/UserContext"
import { useToastAlert } from "@/contexts/ToastContext"

// Import separated components
import { Particle } from "@/components/machine-particle"
import { WaveBackground } from "@/components/machine-wave-background"
import { MachineDetailsTab } from "@/components/machine-details-tab"
import { MachineSensorsTab } from "@/components/machine-sensors-tab"
import { MachineUsageTab } from "@/components/machine-usage-tab"
import { StatusBadge } from "@/components/machine-status-badge"
import { PulseIndicator } from "@/components/machine-pulse-indicator"

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
}

export default function MachineDetailPage() {
    const { id: machineId } = useParams()
    const router = useRouter()
    const { user } = useUser()
    const { toastError, toastSuccess } = useToastAlert()

    const [machine, setMachine] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [activeTab, setActiveTab] = useState("details")
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showSparkles, setShowSparkles] = useState(false)
    const [cycleProgress, setCycleProgress] = useState(0)
    const [cycleInterval, setCycleInterval] = useState(null)
    const [cycleEndTime, setCycleEndTime] = useState(null)
    const [cycleDuration, setCycleDuration] = useState(null)

    const isAdmin = user?.admin === true

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (cycleInterval) {
                clearInterval(cycleInterval)
            }
        }
    }, [cycleInterval])
    const gradeOrder = {
        Apprentice: 0,
        Technician: 1,
        Engineer: 2,
        Manager: 3,
    }

    const fetchMachineData = async (showRefreshing = false) => {
        if (showRefreshing) setIsRefreshing(true)
        try {
            const machineRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machines/${machineId}`, {
                credentials: "include",
            });
            
            if (!machineRes.ok) {
                toastError("Machine not found")
                router.push("/machines")
                return null
            }

            const machineData = await machineRes.json()
            const processedData = {
                ...machineData,
                availableSensors: machineData.availableSensors || [],
                sites: [machineData.site].filter(Boolean),
                currentUsers: machineData.currentUsers || [],
                usageStats: machineData.usageStats || [],
                totalCycles: machineData.totalCycles || 0,
            }
            setMachine(processedData)
            return processedData
        } catch (err) {
            console.error(err)
            toastError("Failed to load machine data")
            if (!showRefreshing) router.push("/machines")
        } finally {
            setLoading(false)
            if (showRefreshing) setIsRefreshing(false)
        }
    }

    const initializeCycleTracking = (endTime, startTime) => {
        const totalDuration = endTime - startTime;
        setCycleEndTime(endTime);
        setCycleDuration(totalDuration);

        if (cycleInterval) {
            clearInterval(cycleInterval);
        }

        const intervalId = setInterval(() => {
            const now = Date.now();
            
            if (now >= endTime) {
                setCycleProgress(100);
                clearInterval(intervalId);
                setCycleInterval(null);
                fetchMachineData();
                return;
            }
            
            const elapsed = now - startTime;
            const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
            const remaining = endTime - now;
            setCycleProgress(progress);
        }, 100);

        setCycleInterval(intervalId);
    };

    // Load machine data and check for active cycles
    useEffect(() => {
        if (!machineId) return;

        const loadMachineAndCycle = async () => {
        const machineData = await fetchMachineData();
        
        // Check if there's an active cycle for current user
        if (machineData?.activeCycle && user) {
            const endTime = new Date(machineData.activeCycle.endTime).getTime();
            const startTime = new Date(machineData.activeCycle.startTime).getTime();

            const now = Date.now();
            if (endTime > now) {
                // Clear any existing interval first
                if (cycleInterval) {
                    clearInterval(cycleInterval);
                    setCycleInterval(null);
                }
                
                // Calculate current progress
                const elapsed = now - startTime;
                const totalDuration = endTime - startTime;
                const currentProgress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
                
                // Set initial progress and start tracking
                setCycleProgress(currentProgress);
                setTimeout(() => {
                    initializeCycleTracking(endTime, startTime);
                }, 0);
            }
        }
    };

        loadMachineAndCycle();
    }, [machineId, user]);

    const handleStartCycle = async () => {
        try {
            setShowSparkles(true)
            setTimeout(() => setShowSparkles(false), 3000)

            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machines/${machineId}/start-cycle`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            })

            if (!res.ok) {
                const errData = await res.json()
                throw new Error(errData.error || "Failed to start cycle")
            }

            const data = await res.json()
            toastSuccess(data.message)
            fetchMachineData()

            // Update the machine data to get the fresh currentUsers list
            await fetchMachineData()

            // Now check if we're in the updated current users list
            if (!user) return // Exit if user is not loaded yet
            
            const isCurrentUser = machine?.currentUsers?.some(u => String(u._id) === String(user._id))

            if (isCurrentUser) {
                const endTime = new Date(data.cycleEndsAt).getTime();
                const startTime = new Date(data.cycleStartsAt).getTime();
                
                setCycleProgress(0);
                initializeCycleTracking(endTime, startTime);
            }
        } catch (err) {
            toastError(err.message)
        }
    }

    const toggleFullscreen = () => setIsFullscreen(!isFullscreen)

    const handleSensorClick = (sensorId) => {
        router.push(`/machines/${machineId}/${sensorId}`)
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col space-y-6">
                    <div className="flex justify-center">
                        <motion.div
                            className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        />
                    </div>
                    <Skeleton className="h-12 w-3/4 mx-auto" />
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-1/3" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {Array(6).fill(0).map((_, i) => (
                                <Skeleton key={i} className="h-6 w-full" />
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    if (!machine) return null

    // Extract sensor designations
    const sensorLabels = machine.availableSensors?.map(sensor => sensor.designation) || []

    // Get latest sensor readings
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const latestStats = machine.usageStats?.find(stat => 
        new Date(stat.day).toDateString() === today.toDateString()
    )

    // For each sensor, get its latest reading value
    const sensorData = sensorLabels.map(label => {
        if (!latestStats || !latestStats.sensorData) return 0
        
        // sensorData is a plain object from MongoDB after using .lean()
        const readings = Object.entries(latestStats.sensorData)
            .find(([key]) => key === label)?.[1] || []
            
        if (readings.length === 0) return 0

        // Get the most recent reading
        const latestReading = readings.reduce((latest, reading) => {
            if (!latest || new Date(reading.timestamp) > new Date(latest.timestamp)) {
                return reading
            }
            return latest
        }, null)

        // Format to 1 decimal place and ensure it's between 0-100
        return latestReading ? Math.min(Math.max(latestReading.value, 0), 100).toFixed(1) : 0
    })

    const userGradeLevel = gradeOrder[user?.grade?.name] ?? -1
    const requiredMachineLevel = gradeOrder[machine.requiredGrade]
    const canStartCycle = userGradeLevel >= requiredMachineLevel || isAdmin
    const recentStats = machine.usageStats
        ? machine.usageStats.slice(-7).sort((a, b) => new Date(a.day) - new Date(b.day))
        : []

    return (
        <motion.div
            className={`container mx-auto px-4 py-8 ${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""}`}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Header */}
            <motion.div className="flex flex-col md:flex-row items-center justify-between mb-8" variants={itemVariants}>
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <motion.div
                        className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        animate={{
                            boxShadow: [
                                "0px 0px 0px rgba(0,0,0,0)",
                                "0px 0px 20px rgba(var(--primary-rgb), 0.5)",
                                "0px 0px 0px rgba(0,0,0,0)",
                            ],
                        }}
                        transition={{
                            boxShadow: {
                                repeat: Number.POSITIVE_INFINITY,
                                duration: 2,
                                repeatType: "reverse",
                            },
                        }}
                    >
                        <Cpu className="h-6 w-6 text-background" />
                    </motion.div>
                    <div>
                        <motion.h1
                            className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            {machine.name}
                        </motion.h1>
                        <div className="flex items-center gap-2 mt-1">
                            <PulseIndicator
                                color={
                                    machine.status === "available"
                                        ? "bg-emerald-500"
                                        : machine.status === "in-use"
                                            ? "bg-amber-500"
                                            : "bg-destructive"
                                }
                            />
                            <StatusBadge status={machine.status} />
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => fetchMachineData(true)}
                                        disabled={isRefreshing}
                                        aria-label="Refresh machine data"
                                        className="relative overflow-hidden border-primary/30 hover:border-primary"
                                    >
                                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                                        <motion.div
                                            className="absolute inset-0 bg-primary rounded-md"
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={
                                                isRefreshing
                                                    ? {
                                                        scale: [1, 1.5, 1],
                                                        opacity: [0.5, 0, 0.5],
                                                    }
                                                    : {}
                                            }
                                            transition={{
                                                repeat: isRefreshing ? Number.POSITIVE_INFINITY : 0,
                                                duration: 1.5,
                                            }}
                                        />
                                    </Button>
                                </motion.div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-popover border-border text-popover-foreground">
                                <p>Refresh machine data</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Link href="/machines">
                                        <Button variant="outline" className="flex items-center gap-2 relative overflow-hidden border-primary/30 hover:border-primary">
                                            <ArrowLeft className="h-4 w-4" />
                                            <span>Back to Machines</span>
                                            <motion.div
                                                className="absolute inset-0 bg-primary"
                                                initial={{ x: "100%" }}
                                                whileHover={{ x: "0%" }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </Button>
                                    </Link>
                                </motion.div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-popover border-border text-popover-foreground">
                                <p>Return to machines list</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </motion.div>

            {/* Tabs Navigation */}
            <motion.div className="mb-8" variants={itemVariants}>
                <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-3 mb-6 relative bg-muted backdrop-blur-sm">
                        <motion.div
                            className="absolute bottom-0 h-0.5 bg-primary rounded-full"
                            animate={{
                                left: activeTab === "details" ? "0%" : activeTab === "sensors" ? "33.33%" : "66.66%",
                                width: "33.33%",
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                        <TabsTrigger value="details" className="flex items-center gap-2 relative z-10 data-[state=active]:bg-background data-[state=active]:text-primary">
                            <Info className="h-4 w-4" />
                            <span>Details</span>
                        </TabsTrigger>
                        <TabsTrigger value="sensors" className="flex items-center gap-2 relative z-10 data-[state=active]:bg-background data-[state=active]:text-primary">
                            <Layers className="h-4 w-4" />
                            <span>Sensors</span>
                        </TabsTrigger>
                        {/* <TabsTrigger value="usage" className="flex items-center gap-2 relative z-10 data-[state=active]:bg-background data-[state=active]:text-primary">
                            <BarChart2 className="h-4 w-4" />
                            <span>Usage</span>
                        </TabsTrigger> */}
                    </TabsList>

                    <AnimatePresence mode="wait">
                        {activeTab === "details" && (
                            <TabsContent value="details" forceMount>
                                <MachineDetailsTab
                                    machine={machine}
                                    canStartCycle={canStartCycle}
                                    isAdmin={isAdmin}
                                    user={user}
                                    showSparkles={showSparkles}
                                    onStartCycle={handleStartCycle}
                                    cycleProgress={cycleProgress}
                                    onEmergencyStop={async () => {
                                        try {
                                            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machines/${machineId}/stop-cycle`, {
                                                method: "POST",
                                                credentials: "include",
                                            });
                                            
                                            if (!res.ok) {
                                                throw new Error("Failed to stop cycle");
                                            }

                                            toastSuccess("Cycle stopped successfully");
                                            // Reset all cycle-related states
                                            setCycleProgress(0);
                                            setCycleEndTime(null);
                                            setCycleDuration(null);
                                            if (cycleInterval) {
                                                clearInterval(cycleInterval);
                                                setCycleInterval(null);
                                            }
                                            fetchMachineData();
                                        } catch (err) {
                                            console.error(err);
                                            toastError("Failed to stop cycle");
                                        }
                                    }}
                                />
                            </TabsContent>
                        )}

                        {activeTab === "sensors" && (
                            <TabsContent value="sensors" forceMount>
                                <MachineSensorsTab
                                    machine={machine}
                                    sensorData={sensorData}
                                    sensorLabels={sensorLabels}
                                    userGradeLevel={userGradeLevel}
                                    isAdmin={isAdmin}
                                    gradeOrder={gradeOrder}
                                    onSensorClick={handleSensorClick}
                                />
                            </TabsContent>
                        )}

                        {/* {activeTab === "usage" && (
                            <TabsContent value="usage" forceMount>
                                <MachineUsageTab
                                    machine={machine}
                                    recentStats={recentStats}
                                />
                            </TabsContent>
                        )} */}
                    </AnimatePresence>
                </Tabs>
            </motion.div>
        </motion.div>
    )
}
