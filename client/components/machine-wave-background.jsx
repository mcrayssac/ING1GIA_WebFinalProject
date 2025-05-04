"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useInView, animate as frameAnimate } from "framer-motion"
import {
    Cpu,
    ArrowLeft,
    Play,
    RefreshCw,
    Layers,
    Tag,
    Users,
    Award,
    Activity,
    MapPin,
    Clock,
    ChevronRight,
    Info,
    BarChart2,
    Calendar,
    Lock,
    Unlock,
    Zap,
    Settings,
    Maximize,
    Minimize,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from "@/contexts/UserContext"
import { useToastAlert } from "@/contexts/ToastContext"

// Particle component for background effects
const Particle = ({ className }) => {
    const x = useMotionValue(Math.random() * 100)
    const y = useMotionValue(Math.random() * 100)
    const opacity = useMotionValue(Math.random() * 0.5 + 0.2)
    const size = Math.random() * 6 + 2

    useEffect(() => {
        const xMovement = Math.random() * 20 - 10
        const yMovement = Math.random() * 20 - 10
        const opacityChange = Math.random() * 0.3

        const intervalId = setInterval(() => {
            x.set(x.get() + xMovement * 0.01)
            y.set(y.get() + yMovement * 0.01)
            opacity.set(
                Math.max(0.1, Math.min(0.7, opacity.get() + (Math.random() > 0.5 ? opacityChange : -opacityChange) * 0.01)),
            )

            // Reset position if particle moves out of container
            if (x.get() < 0 || x.get() > 100 || y.get() < 0 || y.get() > 100) {
                x.set(Math.random() * 100)
                y.set(Math.random() * 100)
            }
        }, 50)

        return () => clearInterval(intervalId)
    }, [])

    return (
        <motion.div
            className={`absolute rounded-full ${className}`}
            style={{
                x: `${x.get()}%`,
                y: `${y.get()}%`,
                opacity: opacity,
                width: size,
                height: size,
            }}
            animate={{
                x: `${x.get()}%`,
                y: `${y.get()}%`,
                opacity: opacity,
            }}
            transition={{ duration: 3, ease: "easeInOut" }}
        />
    )
}

// Animated background component
const AnimatedBackground = ({ children, className }) => {
    return (
        <div className={`relative overflow-hidden ${className}`}>
            {Array.from({ length: 20 }).map((_, i) => (
                <Particle key={i} className="bg-primary/10" />
            ))}
            {children}
        </div>
    )
}

// 3D Card component with tilt effect
const TiltCard = ({ children, className }) => {
    const cardRef = useRef(null)
    const [rotateX, setRotateX] = useState(0)
    const [rotateY, setRotateY] = useState(0)
    const [scale, setScale] = useState(1)

    const handleMouseMove = (e) => {
        if (!cardRef.current) return
        const card = cardRef.current
        const rect = card.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const posX = e.clientX - centerX
        const posY = e.clientY - centerY
        const rotateXValue = (posY / (rect.height / 2)) * -5
        const rotateYValue = (posX / (rect.width / 2)) * 5
        setRotateX(rotateXValue)
        setRotateY(rotateYValue)
        setScale(1.02)
    }

    const handleMouseLeave = () => {
        setRotateX(0)
        setRotateY(0)
        setScale(1)
    }

    const springConfig = { stiffness: 300, damping: 30 }
    const springRotateX = useSpring(rotateX, springConfig)
    const springRotateY = useSpring(rotateY, springConfig)
    const springScale = useSpring(scale, springConfig)

    return (
        <motion.div
            ref={cardRef}
            className={`${className} relative perspective-1000 transform-gpu`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX: springRotateX,
                rotateY: springRotateY,
                scale: springScale,
                transformStyle: "preserve-3d",
            }}
        >
            <div className="relative z-10">{children}</div>
            <div
                className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"
                style={{ transform: "translateZ(-10px)" }}
            />
        </motion.div>
    )
}

// Animated counter component
const AnimatedCounter = ({ value, className }) => {
    const ref = useRef(null)
    const inView = useInView(ref, { once: false, margin: "-100px" })
    const count = useMotionValue(0)
    const rounded = useTransform(count, (latest) => Math.round(latest))
    const displayValue = useMotionValue(0)

    useEffect(() => {
        if (inView) {
            const controls = animate(count, value, {
                duration: 1.5,
                ease: "easeOut",
            })
            return controls.stop
        }
    }, [count, inView, value])

    useEffect(() => {
        const unsubscribe = rounded.onChange((latest) => {
            displayValue.set(latest)
        })
        return unsubscribe
    }, [rounded, displayValue])

    return (
        <motion.span ref={ref} className={className}>
            {inView ? rounded : 0}
        </motion.span>
    )
}

// Pulse animation for status indicators
const PulseIndicator = ({ color = "bg-green-500", size = "h-3 w-3" }) => {
    return (
        <div className="relative flex">
            <div className={`${size} rounded-full ${color}`}></div>
            <div
                className={`absolute inset-0 ${color} rounded-full animate-ping opacity-75`}
                style={{ animationDuration: "2s" }}
            ></div>
        </div>
    )
}

// Animated progress bar
const AnimatedProgressBar = ({ value, max, className }) => {
    const percentage = (value / max) * 100
    const scaleX = useMotionValue(0)
    const ref = useRef(null)
    const inView = useInView(ref, { once: false })

    useEffect(() => {
        if (inView) {
            animate(scaleX, percentage / 100, {
                duration: 1,
                ease: "easeOut",
            })
        }
    }, [scaleX, percentage, inView])

    return (
        <div ref={ref} className={`h-2 bg-gray-200 rounded-full overflow-hidden ${className}`}>
            <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary"
                style={{ scaleX, transformOrigin: "left" }}
            ></motion.div>
        </div>
    )
}

// Animated wave background
export const WaveBackground = ({ className }) => {
    return (
        <div className={`absolute inset-0 overflow-hidden ${className}`}>
            <svg
                className="absolute bottom-0 left-0 w-full"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1440 320"
                preserveAspectRatio="none"
            >
                <motion.path
                    fill="currentColor"
                    fillOpacity="0.05"
                    d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,181.3C960,181,1056,203,1152,208C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    animate={{
                        d: [
                            "M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,181.3C960,181,1056,203,1152,208C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                            "M0,256L48,240C96,224,192,192,288,181.3C384,171,480,181,576,186.7C672,192,768,192,864,176C960,160,1056,128,1152,128C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                            "M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,181.3C960,181,1056,203,1152,208C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                        ],
                    }}
                    transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                        duration: 10,
                        ease: "easeInOut",
                    }}
                />
                <motion.path
                    fill="currentColor"
                    fillOpacity="0.1"
                    d="M0,128L48,144C96,160,192,192,288,197.3C384,203,480,181,576,154.7C672,128,768,96,864,101.3C960,107,1056,149,1152,154.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    animate={{
                        d: [
                            "M0,128L48,144C96,160,192,192,288,197.3C384,203,480,181,576,154.7C672,128,768,96,864,101.3C960,107,1056,149,1152,154.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                            "M0,160L48,149.3C96,139,192,117,288,128C384,139,480,181,576,186.7C672,192,768,160,864,165.3C960,171,1056,213,1152,218.7C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                            "M0,128L48,144C96,160,192,192,288,197.3C384,203,480,181,576,154.7C672,128,768,96,864,101.3C960,107,1056,149,1152,154.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                        ],
                    }}
                    transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                        duration: 8,
                        ease: "easeInOut",
                    }}
                />
            </svg>
        </div>
    )
}

// Animated radar chart for sensor data
const RadarChart = ({ data = [], className }) => {
    const chartSize = 200
    const centerX = chartSize / 2
    const centerY = chartSize / 2
    const radius = chartSize * 0.4

    // Generate points for the radar chart
    const points = data.map((value, i) => {
        const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2
        const x = centerX + radius * Math.cos(angle) * (value / 100)
        const y = centerY + radius * Math.sin(angle) * (value / 100)
        return { x, y }
    })

    // Create a path string for the radar shape
    const pathData =
        points.length > 0 ? points.map((point, i) => `${i === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ") + "Z" : ""

    return (
        <div className={`relative ${className}`}>
            <svg width={chartSize} height={chartSize} viewBox={`0 0 ${chartSize} ${chartSize}`} className="w-full h-full">
                {/* Background circles */}
                {[0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => (
                    <circle
                        key={i}
                        cx={centerX}
                        cy={centerY}
                        r={radius * scale}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeOpacity="0.1"
                    />
                ))}

                {/* Axis lines */}
                {data.map((_, i) => {
                    const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2
                    const x = centerX + radius * Math.cos(angle)
                    const y = centerY + radius * Math.sin(angle)
                    return (
                        <line
                            key={i}
                            x1={centerX}
                            y1={centerY}
                            x2={x}
                            y2={y}
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeOpacity="0.1"
                        />
                    )
                })}

                {/* Data area */}
                <motion.path
                    d={pathData}
                    fill="url(#radarGradient)"
                    fillOpacity="0.5"
                    stroke="url(#radarStrokeGradient)"
                    strokeWidth="2"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                />

                {/* Data points */}
                {points.map((point, i) => (
                    <motion.circle
                        key={i}
                        cx={point.x}
                        cy={point.y}
                        r="4"
                        fill="var(--primary)"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.5, type: "spring" }}
                    />
                ))}

                {/* Gradients */}
                <defs>
                    <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0.7" />
                    </linearGradient>
                    <linearGradient id="radarStrokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--primary)" />
                        <stop offset="100%" stopColor="var(--secondary)" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    )
}

// Animated circular progress
const CircularProgress = ({ value, max = 100, size = 80, strokeWidth = 8, className }) => {
    const percentage = (value / max) * 100
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (percentage / 100) * circumference

    return (
        <div className={`relative ${className}`} style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeOpacity="0.1"
                />
                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="url(#circleGradient)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    style={{
                        strokeDasharray: circumference,
                    }}
                />
                <defs>
                    <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--primary)" />
                        <stop offset="100%" stopColor="var(--secondary)" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                <AnimatedCounter value={percentage} />%
            </div>
        </div>
    )
}

// Floating icons animation
const FloatingIcon = ({ icon: Icon, delay = 0, className }) => {
    return (
        <motion.div
            className={`absolute ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: [0, 1, 0], y: [20, -20, 20] }}
            transition={{
                duration: 3,
                delay,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                times: [0, 0.5, 1],
                ease: "easeInOut",
            }}
        >
            <Icon className="h-4 w-4 text-primary/40" />
        </motion.div>
    )
}

// Animated status badge component with animations
const StatusBadge = ({ status }) => {
    let bgColor, textColor, icon

    switch (status) {
        case "available":
            bgColor = "bg-green-100"
            textColor = "text-green-800"
            icon = <CheckCircle className="w-3 h-3 mr-1" />
            break
        case "in-use":
            bgColor = "bg-yellow-100"
            textColor = "text-yellow-800"
            icon = <Clock className="w-3 h-3 mr-1" />
            break
        case "blocked":
            bgColor = "bg-red-100"
            textColor = "text-red-800"
            icon = <XCircle className="w-3 h-3 mr-1" />
            break
        default:
            bgColor = "bg-gray-100"
            textColor = "text-gray-800"
            icon = <Info className="w-3 h-3 mr-1" />
    }

    return (
        <motion.span
            className={`inline-flex items-center px-2 py-1 ${bgColor} ${textColor} rounded-full text-xs font-medium`}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
        >
            {status}
        </motion.span>
    )
}

// Custom badge component with animations
const AnimatedBadge = ({ children, color = "blue", icon }) => {
    const colors = {
        blue: "bg-blue-100 text-blue-800",
        gray: "bg-gray-100 text-gray-800",
        purple: "bg-purple-100 text-purple-800",
        green: "bg-green-100 text-green-800",
        yellow: "bg-yellow-100 text-yellow-800",
        red: "bg-red-100 text-red-800",
    }

    return (
        <motion.span
            className={`inline-flex items-center px-2 py-1 ${colors[color]} rounded-full text-xs font-medium`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
        >
            {icon && <span className="mr-1">{icon}</span>}
            {children}
        </motion.span>
    )
}

// Import missing components
const CheckCircle = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
)

const XCircle = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
)

// Helper function for animations
const animate = (value, target, options) => {
    return frameAnimate(value, target, options)
}

const normalizeId = (id) =>
    typeof id === "object" && id !== null ? (id._id ?? JSON.stringify(id)) : (id?.toString?.() ?? String(id))

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
    const isAdmin = user?.admin === true
    const gradeOrder = {
        Apprentice: 0,
        Technician: 1,
        Engineer: 2,
        Manager: 3,
    }

    // Simulated sensor data for visualization
    const sensorData = [75, 60, 85, 40, 90]
    const sensorLabels = ["Temperature", "Pressure", "Voltage", "Current", "Speed"]

    const fetchMachineData = async (showRefreshing = false) => {
        if (showRefreshing) setIsRefreshing(true)

        try {
            const machineRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machines/${machineId}`, {
                credentials: "include",
            })

            if (!machineRes.ok) {
                toastError("Machine not found")
                router.push("/machines")
                return
            }

            const machineData = await machineRes.json()
            setMachine({
                ...machineData,
                availableSensors: machineData.availableSensors || [],
                sites: [machineData.site].filter(Boolean),
                currentUsers: machineData.currentUsers || [],
                usageStats: machineData.usageStats || [],
                totalCycles: machineData.totalCycles || 0,
            })
        } catch (err) {
            toastError("Failed to load machine data")
            if (!showRefreshing) router.push("/machines")
        } finally {
            setLoading(false)
            if (showRefreshing) setIsRefreshing(false)
        }
    }

    useEffect(() => {
        if (!machineId) return
        fetchMachineData()
    }, [machineId])

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
        } catch (err) {
            toastError(err.message)
        }
    }

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen)
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
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {Array(6)
                                .fill(0)
                                .map((_, i) => (
                                    <Skeleton key={i} className="h-6 w-full" />
                                ))}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-1/3" />
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            {Array(4)
                                .fill(0)
                                .map((_, i) => (
                                    <Skeleton key={i} className="h-10 w-24" />
                                ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    if (!machine) return null

    const userGradeLevel = gradeOrder[user?.grade?.name] ?? -1
    const requiredMachineLevel = gradeOrder[machine.requiredGrade]
    const canStartCycle = userGradeLevel >= requiredMachineLevel || isAdmin

    // Get the last 7 days of usage stats if available
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
            {/* Fullscreen toggle */}
            <motion.button
                className="fixed top-4 right-4 z-50 p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-lg"
                onClick={toggleFullscreen}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </motion.button>

            {/* Animated background */}
            <AnimatedBackground className="absolute inset-0 -z-10" />
            <WaveBackground className="text-primary -z-10" />

            {/* Header with 3D effect */}
            <motion.div className="flex flex-col md:flex-row items-center justify-between mb-8" variants={itemVariants}>
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <motion.div
                        className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg"
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
                        <Cpu className="h-8 w-8 text-primary-foreground" />
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
                                        ? "bg-green-500"
                                        : machine.status === "in-use"
                                            ? "bg-yellow-500"
                                            : "bg-red-500"
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
                                        className="relative overflow-hidden"
                                    >
                                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                                        <motion.div
                                            className="absolute inset-0 bg-primary/10 rounded-md"
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
                            <TooltipContent>
                                <p>Refresh machine data</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Link href="/machines">
                                        <Button variant="outline" className="flex items-center gap-2 relative overflow-hidden">
                                            <ArrowLeft className="h-4 w-4" />
                                            <span>Back to Machines</span>
                                            <motion.div
                                                className="absolute inset-0 bg-primary/5"
                                                initial={{ x: "100%" }}
                                                whileHover={{ x: "0%" }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </Button>
                                    </Link>
                                </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Return to machines list</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </motion.div>

            {/* Tabs Navigation with animated underline */}
            <motion.div className="mb-8" variants={itemVariants}>
                <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-3 mb-6 relative">
                        <motion.div
                            className="absolute bottom-0 h-0.5 bg-primary rounded-full"
                            animate={{
                                left: activeTab === "details" ? "0%" : activeTab === "sensors" ? "33.33%" : "66.66%",
                                width: "33.33%",
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                        <TabsTrigger value="details" className="flex items-center gap-2 relative z-10">
                            <Info className="h-4 w-4" />
                            <span>Details</span>
                            <motion.div
                                className="absolute -z-10 inset-0 bg-primary/5 rounded-md"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: activeTab === "details" ? 1 : 0 }}
                            />
                        </TabsTrigger>
                        <TabsTrigger value="sensors" className="flex items-center gap-2 relative z-10">
                            <Layers className="h-4 w-4" />
                            <span>Sensors</span>
                            <motion.div
                                className="absolute -z-10 inset-0 bg-primary/5 rounded-md"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: activeTab === "sensors" ? 1 : 0 }}
                            />
                        </TabsTrigger>
                        <TabsTrigger value="usage" className="flex items-center gap-2 relative z-10">
                            <BarChart2 className="h-4 w-4" />
                            <span>Usage</span>
                            <motion.div
                                className="absolute -z-10 inset-0 bg-primary/5 rounded-md"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: activeTab === "usage" ? 1 : 0 }}
                            />
                        </TabsTrigger>
                    </TabsList>

                    {/* Details Tab */}
                    <AnimatePresence mode="wait">
                        {activeTab === "details" && (
                            <TabsContent value="details" forceMount>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                >
                                    {/* Basic Information Card with 3D effect */}
                                    <TiltCard>
                                        <Card className="h-full backdrop-blur-sm bg-background/80 border-primary/10">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Tag className="h-5 w-5" />
                                                    <span>Basic Information</span>
                                                </CardTitle>
                                                <CardDescription>Core details about this machine</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4 relative">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Main Pole</p>
                                                        <motion.p
                                                            className="font-medium"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: 0.1 }}
                                                        >
                                                            {machine.mainPole}
                                                        </motion.p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Sub Pole</p>
                                                        <motion.p
                                                            className="font-medium"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: 0.2 }}
                                                        >
                                                            {machine.subPole}
                                                        </motion.p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Points Per Cycle</p>
                                                        <motion.p
                                                            className="font-medium"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: 0.3 }}
                                                        >
                                                            <AnimatedCounter value={machine.pointsPerCycle} className="font-medium" />
                                                        </motion.p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Max Users</p>
                                                        <motion.p
                                                            className="font-medium"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: 0.4 }}
                                                        >
                                                            <AnimatedCounter value={machine.maxUsers} className="font-medium" />
                                                        </motion.p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Required Grade</p>
                                                        <AnimatedBadge color="purple" icon={<Award className="h-3 w-3" />}>
                                                            {machine.requiredGrade}
                                                        </AnimatedBadge>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Total Cycles</p>
                                                        <motion.p
                                                            className="font-medium"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: 0.5 }}
                                                        >
                                                            <AnimatedCounter value={machine.totalCycles} className="font-medium" />
                                                        </motion.p>
                                                    </div>
                                                </div>

                                                {/* Floating icons for visual interest */}
                                                <FloatingIcon icon={Settings} delay={0} className="top-0 right-0" />
                                                <FloatingIcon icon={Activity} delay={1} className="bottom-0 left-10" />
                                                <FloatingIcon icon={Zap} delay={2} className="top-10 right-10" />
                                            </CardContent>
                                        </Card>
                                    </TiltCard>

                                    {/* Location Card with 3D map effect */}
                                    <TiltCard>
                                        <Card className="h-full backdrop-blur-sm bg-background/80 border-primary/10">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <MapPin className="h-5 w-5" />
                                                    <span>Location</span>
                                                </CardTitle>
                                                <CardDescription>Where this machine is installed</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <motion.div
                                                    className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg flex items-center justify-center h-40 relative overflow-hidden"
                                                    whileHover={{ scale: 1.02 }}
                                                >
                                                    {/* Animated map grid background */}
                                                    <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
                                                        {Array.from({ length: 100 }).map((_, i) => (
                                                            <motion.div
                                                                key={i}
                                                                className="border-[0.5px] border-primary/5"
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                transition={{ delay: i * 0.001, duration: 0.5 }}
                                                            />
                                                        ))}
                                                    </div>

                                                    {/* Location pin with pulse effect */}
                                                    <motion.div
                                                        className="relative z-10 text-center"
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ type: "spring", delay: 0.5 }}
                                                    >
                                                        <motion.div
                                                            className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2"
                                                            animate={{
                                                                boxShadow: [
                                                                    "0px 0px 0px rgba(0,0,0,0)",
                                                                    "0px 0px 20px rgba(var(--primary-rgb), 0.3)",
                                                                    "0px 0px 0px rgba(0,0,0,0)",
                                                                ],
                                                            }}
                                                            transition={{
                                                                repeat: Number.POSITIVE_INFINITY,
                                                                duration: 2,
                                                                repeatType: "reverse",
                                                            }}
                                                        >
                                                            <MapPin className="h-6 w-6 text-primary" />
                                                        </motion.div>
                                                        <p className="text-lg font-medium">{machine.sites[0]?.name || "No site assigned"}</p>
                                                        {machine.sites[0] && (
                                                            <motion.p
                                                                className="text-sm text-muted-foreground mt-1"
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                transition={{ delay: 0.7 }}
                                                            >
                                                                {machine.sites[0].location || "No location details"}
                                                            </motion.p>
                                                        )}
                                                    </motion.div>
                                                </motion.div>
                                            </CardContent>
                                        </Card>
                                    </TiltCard>

                                    {/* Current Users Card with animated avatars */}
                                    <TiltCard>
                                        <Card className="h-full backdrop-blur-sm bg-background/80 border-primary/10">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Users className="h-5 w-5" />
                                                    <span>Current Users</span>
                                                </CardTitle>
                                                <CardDescription>Users currently using this machine</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {machine.currentUsers && machine.currentUsers.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {machine.currentUsers.map((user, index) => (
                                                            <motion.div
                                                                key={index}
                                                                className="flex items-center justify-between p-3 bg-primary/5 rounded-md"
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: index * 0.1 }}
                                                                whileHover={{ scale: 1.02, backgroundColor: "rgba(var(--primary-rgb), 0.1)" }}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <motion.div
                                                                        className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
                                                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                                                    >
                                                                        <Users className="h-5 w-5 text-primary" />
                                                                    </motion.div>
                                                                    <span className="font-medium">{user.name || `User ${index + 1}`}</span>
                                                                </div>
                                                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                                                    Active
                                                                </Badge>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <motion.div
                                                        className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 0.3 }}
                                                    >
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                                        >
                                                            <Users className="h-16 w-16 mb-3 opacity-20" />
                                                        </motion.div>
                                                        <p className="text-lg">No active users</p>
                                                        <p className="text-sm mt-1">The machine is currently not in use</p>
                                                    </motion.div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </TiltCard>

                                    {/* Action Card with animated button */}
                                    <TiltCard>
                                        <Card className="h-full backdrop-blur-sm bg-background/80 border-primary/10 relative overflow-hidden">
                                            {showSparkles && (
                                                <motion.div
                                                    className="absolute inset-0 z-10 pointer-events-none"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                >
                                                    {Array.from({ length: 50 }).map((_, i) => (
                                                        <motion.div
                                                            key={i}
                                                            className="absolute w-1 h-1 bg-primary rounded-full"
                                                            initial={{
                                                                x: "50%",
                                                                y: "50%",
                                                                scale: 0,
                                                                opacity: 1,
                                                            }}
                                                            animate={{
                                                                x: `${Math.random() * 100}%`,
                                                                y: `${Math.random() * 100}%`,
                                                                scale: Math.random() * 3,
                                                                opacity: 0,
                                                            }}
                                                            transition={{
                                                                duration: 1 + Math.random() * 2,
                                                                delay: Math.random() * 0.5,
                                                            }}
                                                        />
                                                    ))}
                                                </motion.div>
                                            )}

                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Activity className="h-5 w-5" />
                                                    <span>Machine Control</span>
                                                </CardTitle>
                                                <CardDescription>Start a cycle or manage this machine</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-6 relative">
                                                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                                                    <PulseIndicator
                                                        color={
                                                            machine.status === "available"
                                                                ? "bg-green-500"
                                                                : machine.status === "in-use"
                                                                    ? "bg-yellow-500"
                                                                    : "bg-red-500"
                                                        }
                                                        size="h-4 w-4"
                                                    />
                                                    <span>
                                                        {machine.status === "available"
                                                            ? "Machine is available for use"
                                                            : machine.status === "in-use"
                                                                ? "Machine is currently in use"
                                                                : "Machine is blocked"}
                                                    </span>
                                                </div>

                                                <div className="flex justify-center">
                                                    <CircularProgress value={machine.totalCycles} max={1000} size={100} />
                                                </div>

                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="relative">
                                                                <motion.div
                                                                    whileHover={canStartCycle ? { scale: 1.02 } : {}}
                                                                    whileTap={canStartCycle ? { scale: 0.98 } : {}}
                                                                >
                                                                    <Button
                                                                        onClick={handleStartCycle}
                                                                        className="w-full flex items-center justify-center gap-2 h-12 relative overflow-hidden"
                                                                        disabled={!canStartCycle || machine.status !== "available"}
                                                                        variant="default"
                                                                    >
                                                                        <motion.div
                                                                            className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0"
                                                                            animate={
                                                                                canStartCycle && machine.status === "available"
                                                                                    ? {
                                                                                        opacity: [0, 0.5, 0],
                                                                                    }
                                                                                    : {}
                                                                            }
                                                                            transition={{
                                                                                repeat: Number.POSITIVE_INFINITY,
                                                                                duration: 2,
                                                                            }}
                                                                        />
                                                                        <Play className="h-5 w-5" />
                                                                        <span className="font-medium">
                                                                            {!canStartCycle
                                                                                ? "Cycle not authorized"
                                                                                : machine.status !== "available"
                                                                                    ? "Machine unavailable"
                                                                                    : "Start cycle"}
                                                                        </span>
                                                                    </Button>
                                                                </motion.div>

                                                                {/* Animated glow effect for the button */}
                                                                {canStartCycle && machine.status === "available" && (
                                                                    <motion.div
                                                                        className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur-md -z-10"
                                                                        animate={{
                                                                            opacity: [0.5, 1, 0.5],
                                                                        }}
                                                                        transition={{
                                                                            repeat: Number.POSITIVE_INFINITY,
                                                                            duration: 2,
                                                                        }}
                                                                    />
                                                                )}
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {!canStartCycle
                                                                ? `You need ${machine.requiredGrade} grade or higher to use this machine`
                                                                : machine.status !== "available"
                                                                    ? "Machine must be available to start a cycle"
                                                                    : "Start a new machine cycle"}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>

                                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        {canStartCycle ? (
                                                            <motion.div
                                                                animate={{ rotate: [0, 10, -10, 0] }}
                                                                transition={{ repeat: 3, duration: 0.5, delay: 1 }}
                                                            >
                                                                <Unlock className="h-3 w-3" />
                                                            </motion.div>
                                                        ) : (
                                                            <Lock className="h-3 w-3" />
                                                        )}
                                                        <span>Access level: {user?.grade?.name || "Unknown"}</span>
                                                    </div>
                                                    <span>Required: {machine.requiredGrade}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TiltCard>
                                </motion.div>
                            </TabsContent>
                        )}

                        {/* Sensors Tab with radar chart */}
                        {activeTab === "sensors" && (
                            <TabsContent value="sensors" forceMount>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card className="backdrop-blur-sm bg-background/80 border-primary/10 mb-6">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Layers className="h-5 w-5" />
                                                <span>Sensor Overview</span>
                                            </CardTitle>
                                            <CardDescription>Performance metrics from all sensors</CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex flex-col md:flex-row items-center gap-6">
                                            <div className="w-full md:w-1/2 flex justify-center">
                                                <RadarChart data={sensorData} className="max-w-xs" />
                                            </div>
                                            <div className="w-full md:w-1/2 space-y-4">
                                                {sensorLabels.map((label, index) => (
                                                    <div key={index} className="space-y-1">
                                                        <div className="flex justify-between text-sm">
                                                            <span>{label}</span>
                                                            <span className="font-medium">{sensorData[index]}%</span>
                                                        </div>
                                                        <AnimatedProgressBar value={sensorData[index]} max={100} />
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="backdrop-blur-sm bg-background/80 border-primary/10">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Layers className="h-5 w-5" />
                                                <span>Available Sensors</span>
                                            </CardTitle>
                                            <CardDescription>Sensors installed on this machine</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {machine.availableSensors && machine.availableSensors.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {machine.availableSensors.map((sensor, idx) => {
                                                        if (!sensor) return null
                                                        const requiredSensorLevel = gradeOrder[sensor.requiredGrade]
                                                        const hasAccess = userGradeLevel >= requiredSensorLevel || isAdmin

                                                        return (
                                                            <motion.div
                                                                key={sensor._id}
                                                                initial={{ opacity: 0, y: 20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: idx * 0.1 }}
                                                            >
                                                                <TiltCard className={!hasAccess ? "opacity-70" : ""}>
                                                                    <Card className="backdrop-blur-sm bg-background/80 border-primary/10 h-full">
                                                                        <CardContent className="p-4">
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="flex items-center gap-3">
                                                                                    <motion.div
                                                                                        className={`h-10 w-10 rounded-full ${hasAccess ? "bg-gradient-to-br from-primary/20 to-secondary/20" : "bg-muted"} flex items-center justify-center`}
                                                                                        whileHover={{ scale: hasAccess ? 1.1 : 1, rotate: hasAccess ? 5 : 0 }}
                                                                                    >
                                                                                        <Layers className="h-5 w-5" />
                                                                                    </motion.div>
                                                                                    <div>
                                                                                        <p className="font-medium">{sensor.designation}</p>
                                                                                        <p className="text-xs text-muted-foreground">
                                                                                            {hasAccess ? "Access granted" : "Access restricted"}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                                {hasAccess ? (
                                                                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            onClick={() => router.push(`/machines/${machineId}/${sensor._id}`)}
                                                                                            className="h-8 w-8 relative"
                                                                                        >
                                                                                            <ChevronRight className="h-4 w-4" />
                                                                                            <motion.div
                                                                                                className="absolute inset-0 bg-primary/10 rounded-full"
                                                                                                initial={{ scale: 0 }}
                                                                                                whileHover={{ scale: 1 }}
                                                                                            />
                                                                                        </Button>
                                                                                    </motion.div>
                                                                                ) : (
                                                                                    <TooltipProvider>
                                                                                        <Tooltip>
                                                                                            <TooltipTrigger asChild>
                                                                                                <div className="h-8 w-8 flex items-center justify-center">
                                                                                                    <Lock className="h-4 w-4 text-muted-foreground" />
                                                                                                </div>
                                                                                            </TooltipTrigger>
                                                                                            <TooltipContent>
                                                                                                <p>You need higher access level</p>
                                                                                            </TooltipContent>
                                                                                        </Tooltip>
                                                                                    </TooltipProvider>
                                                                                )}
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>
                                                                </TiltCard>
                                                            </motion.div>
                                                        )
                                                    })}
                                                </div>
                                            ) : (
                                                <motion.div
                                                    className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.3 }}
                                                >
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                                    >
                                                        <Layers className="h-24 w-24 mb-4 opacity-20" />
                                                    </motion.div>
                                                    <p className="text-xl">No sensors available</p>
                                                    <p className="text-sm max-w-md mt-2">
                                                        This machine doesn't have any sensors installed or configured.
                                                    </p>
                                                </motion.div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </TabsContent>
                        )}

                        {/* Usage Tab with animated charts */}
                        {activeTab === "usage" && (
                            <TabsContent value="usage" forceMount>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card className="backdrop-blur-sm bg-background/80 border-primary/10">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <BarChart2 className="h-5 w-5" />
                                                <span>Usage Statistics</span>
                                            </CardTitle>
                                            <CardDescription>Machine usage and cycle data</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-8">
                                                {/* Cycles Summary with animated counters */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.1 }}
                                                    >
                                                        <TiltCard>
                                                            <Card className="backdrop-blur-sm bg-background/80 border-primary/10">
                                                                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                                                    <motion.div
                                                                        className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3"
                                                                        animate={{
                                                                            scale: [1, 1.05, 1],
                                                                            rotate: [0, 2, -2, 0],
                                                                        }}
                                                                        transition={{
                                                                            repeat: Number.POSITIVE_INFINITY,
                                                                            repeatType: "reverse",
                                                                            duration: 3,
                                                                        }}
                                                                    >
                                                                        <Activity className="h-6 w-6 text-primary" />
                                                                    </motion.div>
                                                                    <p className="text-sm text-muted-foreground">Total Cycles</p>
                                                                    <p className="text-2xl font-bold">
                                                                        <AnimatedCounter value={machine.totalCycles} />
                                                                    </p>
                                                                </CardContent>
                                                            </Card>
                                                        </TiltCard>
                                                    </motion.div>

                                                    <motion.div
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.2 }}
                                                    >
                                                        <TiltCard>
                                                            <Card className="backdrop-blur-sm bg-background/80 border-primary/10">
                                                                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                                                    <motion.div
                                                                        className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3"
                                                                        animate={{
                                                                            scale: [1, 1.05, 1],
                                                                            rotate: [0, -2, 2, 0],
                                                                        }}
                                                                        transition={{
                                                                            repeat: Number.POSITIVE_INFINITY,
                                                                            repeatType: "reverse",
                                                                            duration: 3,
                                                                            delay: 0.5,
                                                                        }}
                                                                    >
                                                                        <Award className="h-6 w-6 text-primary" />
                                                                    </motion.div>
                                                                    <p className="text-sm text-muted-foreground">Points Per Cycle</p>
                                                                    <p className="text-2xl font-bold">
                                                                        <AnimatedCounter value={machine.pointsPerCycle} />
                                                                    </p>
                                                                </CardContent>
                                                            </Card>
                                                        </TiltCard>
                                                    </motion.div>

                                                    <motion.div
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.3 }}
                                                    >
                                                        <TiltCard>
                                                            <Card className="backdrop-blur-sm bg-background/80 border-primary/10">
                                                                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                                                    <motion.div
                                                                        className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3"
                                                                        animate={{
                                                                            scale: [1, 1.05, 1],
                                                                            rotate: [0, 2, -2, 0],
                                                                        }}
                                                                        transition={{
                                                                            repeat: Number.POSITIVE_INFINITY,
                                                                            repeatType: "reverse",
                                                                            duration: 3,
                                                                            delay: 1,
                                                                        }}
                                                                    >
                                                                        <Users className="h-6 w-6 text-primary" />
                                                                    </motion.div>
                                                                    <p className="text-sm text-muted-foreground">Max Users</p>
                                                                    <p className="text-2xl font-bold">
                                                                        <AnimatedCounter value={machine.maxUsers} />
                                                                    </p>
                                                                </CardContent>
                                                            </Card>
                                                        </TiltCard>
                                                    </motion.div>

                                                    <motion.div
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.4 }}
                                                    >
                                                        <TiltCard>
                                                            <Card className="backdrop-blur-sm bg-background/80 border-primary/10">
                                                                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                                                    <motion.div
                                                                        className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3"
                                                                        animate={{
                                                                            scale: [1, 1.05, 1],
                                                                            rotate: [0, -2, 2, 0],
                                                                        }}
                                                                        transition={{
                                                                            repeat: Number.POSITIVE_INFINITY,
                                                                            repeatType: "reverse",
                                                                            duration: 3,
                                                                            delay: 1.5,
                                                                        }}
                                                                    >
                                                                        <Clock className="h-6 w-6 text-primary" />
                                                                    </motion.div>
                                                                    <p className="text-sm text-muted-foreground">Current Status</p>
                                                                    <StatusBadge status={machine.status} />
                                                                </CardContent>
                                                            </Card>
                                                        </TiltCard>
                                                    </motion.div>
                                                </div>

                                                {/* Usage graph visualization */}
                                                <Card className="backdrop-blur-sm bg-background/80 border-primary/10">
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-lg flex items-center gap-2">
                                                            <BarChart2 className="h-4 w-4" />
                                                            <span>Usage Trends</span>
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-4">
                                                        <div className="h-60 relative">
                                                            {/* Animated bar chart */}
                                                            <div className="absolute inset-0 flex items-end justify-around">
                                                                {Array.from({ length: 7 }).map((_, i) => {
                                                                    const height = Math.random() * 70 + 10
                                                                    return (
                                                                        <motion.div
                                                                            key={i}
                                                                            className="w-[10%] bg-gradient-to-t from-primary to-secondary rounded-t-md"
                                                                            initial={{ height: 0 }}
                                                                            animate={{ height: `${height}%` }}
                                                                            transition={{
                                                                                delay: i * 0.1,
                                                                                duration: 1,
                                                                                type: "spring",
                                                                                stiffness: 100,
                                                                            }}
                                                                        />
                                                                    )
                                                                })}
                                                            </div>

                                                            {/* X-axis labels */}
                                                            <div className="absolute bottom-0 inset-x-0 flex justify-around pt-2 border-t">
                                                                {Array.from({ length: 7 }).map((_, i) => {
                                                                    const date = new Date()
                                                                    date.setDate(date.getDate() - 6 + i)
                                                                    return (
                                                                        <motion.div
                                                                            key={i}
                                                                            className="text-xs text-muted-foreground"
                                                                            initial={{ opacity: 0 }}
                                                                            animate={{ opacity: 1 }}
                                                                            transition={{ delay: 0.5 + i * 0.1 }}
                                                                        >
                                                                            {date.toLocaleDateString(undefined, { weekday: "short" })}
                                                                        </motion.div>
                                                                    )
                                                                })}
                                                            </div>

                                                            {/* Y-axis grid lines */}
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                <motion.div
                                                                    key={i}
                                                                    className="absolute w-full h-px bg-muted-foreground/10"
                                                                    style={{ bottom: `${20 * (i + 1)}%` }}
                                                                    initial={{ scaleX: 0, opacity: 0 }}
                                                                    animate={{ scaleX: 1, opacity: 1 }}
                                                                    transition={{ delay: 0.2 * i, duration: 0.5 }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                {/* Recent Usage */}
                                                <Card className="backdrop-blur-sm bg-background/80 border-primary/10">
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-lg flex items-center gap-2">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>Recent Usage</span>
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        {recentStats.length > 0 ? (
                                                            <div className="space-y-3">
                                                                {recentStats.map((stat, index) => (
                                                                    <motion.div
                                                                        key={index}
                                                                        className="flex items-center justify-between p-3 bg-primary/5 rounded-md"
                                                                        initial={{ opacity: 0, x: -20 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        transition={{ delay: index * 0.1 }}
                                                                        whileHover={{
                                                                            scale: 1.02,
                                                                            backgroundColor: "rgba(var(--primary-rgb), 0.1)",
                                                                        }}
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <motion.div
                                                                                className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center"
                                                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                                            >
                                                                                <Calendar className="h-5 w-5 text-primary" />
                                                                            </motion.div>
                                                                            <span className="font-medium">
                                                                                {new Date(stat.day).toLocaleDateString(undefined, {
                                                                                    weekday: "long",
                                                                                    month: "short",
                                                                                    day: "numeric",
                                                                                })}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center gap-4">
                                                                            <div className="text-sm">
                                                                                <span className="text-muted-foreground mr-1">Usage periods:</span>
                                                                                <span className="font-medium">{stat.usagePeriods?.length || 0}</span>
                                                                            </div>
                                                                            <div className="text-sm">
                                                                                <span className="text-muted-foreground mr-1">Sensor readings:</span>
                                                                                <span className="font-medium">{Object.keys(stat.sensorData || {}).length}</span>
                                                                            </div>
                                                                            <motion.div
                                                                                className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center"
                                                                                whileHover={{ scale: 1.1 }}
                                                                            >
                                                                                <ChevronRight className="h-4 w-4" />
                                                                            </motion.div>
                                                                        </div>
                                                                    </motion.div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <motion.div
                                                                className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground"
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                transition={{ delay: 0.3 }}
                                                            >
                                                                <motion.div
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                                                >
                                                                    <BarChart2 className="h-16 w-16 mb-3 opacity-20" />
                                                                </motion.div>
                                                                <p className="text-lg">No recent usage data available</p>
                                                                <p className="text-sm mt-1">This machine hasn't been used recently</p>
                                                            </motion.div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </TabsContent>
                        )}
                    </AnimatePresence>
                </Tabs>
            </motion.div>
        </motion.div>
    )
}
