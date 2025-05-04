"use client"

import { motion } from "framer-motion"
import { Activity, Users, Clock, BarChart2, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TiltCard } from "./machine-tilt-card"
import { CircularProgress } from "./machine-circular-progress"
import { AnimatedCounter } from "./machine-animated-counter"
import { PulseIndicator } from "./machine-pulse-indicator"

export const MachineUsageTab = ({ machine, recentStats }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="backdrop-blur-sm bg-card border-border shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                        <BarChart2 className="h-5 w-5 text-primary" />
                        <span>Usage Statistics</span>
                    </CardTitle>
                    <CardDescription>Machine usage and cycle data</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Total Cycles */}
                            <TiltCard>
                                <StatsCard
                                    icon={Activity}
                                    label="Total Cycles"
                                    value={machine.totalCycles}
                                    delay={0.1}
                                />
                            </TiltCard>

                            {/* Max Users */}
                            <TiltCard>
                                <StatsCard
                                    icon={Users}
                                    label="Max Users"
                                    value={machine.maxUsers}
                                    delay={0.2}
                                />
                            </TiltCard>

                            {/* Current Status */}
                            <TiltCard>
                                <Card className="backdrop-blur-sm bg-card border-border shadow-md">
                                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                        <StatusIcon status={machine.status} />
                                        <p className="text-sm text-muted-foreground">Current Status</p>
                                        <div className="flex items-center gap-2">
                                            <PulseIndicator
                                                color={getStatusColor(machine.status)}
                                                size="h-4 w-4"
                                            />
                                            <span className="text-sm font-medium text-card-foreground">{machine.status}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TiltCard>

                            {/* Progress */}
                            <TiltCard>
                                <Card className="backdrop-blur-sm bg-card border-border shadow-md">
                                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                        <CircularProgress value={machine.totalCycles} max={1000} size={100} />
                                    </CardContent>
                                </Card>
                            </TiltCard>
                        </div>

                        {/* Usage Graph */}
                        <UsageGraph />

                        {/* Recent Usage Stats */}
                        <RecentUsageStats stats={recentStats} />
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

// Helper Components
const StatsCard = ({ icon: Icon, label, value, delay }) => (
    <Card className="backdrop-blur-sm bg-card border-border shadow-md">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <motion.div
                className="h-12 w-12 rounded-full bg-primary flex items-center justify-center mb-3"
                animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0],
                }}
                transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    duration: 3,
                    delay,
                }}
            >
                <Icon className="h-6 w-6 text-primary" />
            </motion.div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-card-foreground">
                <AnimatedCounter value={value} />
            </p>
        </CardContent>
    </Card>
)

const StatusIcon = ({ status }) => (
    <motion.div
        className="h-12 w-12 rounded-full bg-primary flex items-center justify-center mb-3"
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
)

const UsageGraph = () => (
    <Card className="backdrop-blur-sm bg-card border-border shadow-md">
        <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-card-foreground">
                <BarChart2 className="h-4 w-4 text-primary" />
                <span>Usage Trends</span>
            </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
            <div className="h-60 relative">
                <WeeklyBarChart />
                <TimeAxisLabels />
                <GridLines />
            </div>
        </CardContent>
    </Card>
)

const WeeklyBarChart = () => (
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
)

const TimeAxisLabels = () => (
    <div className="absolute bottom-0 inset-x-0 flex justify-around pt-2 border-t border-border">
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
)

const GridLines = () => (
    <>
        {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
                key={i}
                className="absolute w-full h-px bg-muted-foreground"
                style={{ bottom: `${20 * (i + 1)}%` }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 0.1 }}
                transition={{ delay: 0.2 * i, duration: 0.5 }}
            />
        ))}
    </>
)

const RecentUsageStats = ({ stats }) => (
    <Card className="backdrop-blur-sm bg-card border-border shadow-md">
        <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-card-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                <span>Recent Usage</span>
            </CardTitle>
        </CardHeader>
        <CardContent>
            {stats.length > 0 ? (
                <div className="space-y-3">
                    {stats.map((stat, index) => (
                        <UsageStatRow key={index} stat={stat} index={index} />
                    ))}
                </div>
            ) : (
                <NoUsageData />
            )}
        </CardContent>
    </Card>
)

const UsageStatRow = ({ stat, index }) => (
    <motion.div
        className="flex items-center justify-between p-3 bg-muted rounded-md"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{
            scale: 1.02,
            backgroundColor: "rgba(var(--primary-rgb), 0.1)",
        }}
    >
        <div className="flex items-center gap-4">
            <StatValue label="Date" value={new Date(stat.day).toLocaleDateString()} />
            <StatValue label="Cycles" value={stat.cycles} />
            <StatValue label="Users" value={stat.users} />
            <StatValue label="Points" value={stat.points} />
        </div>
    </motion.div>
)

const StatValue = ({ label, value }) => (
    <div className="text-sm">
        <span className="text-muted-foreground mr-1">{label}:</span>
        <span className="font-medium text-card-foreground">{value}</span>
    </div>
)

const NoUsageData = () => (
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
)

// Helper function
const getStatusColor = (status) => {
    switch (status) {
        case "available":
            return "bg-emerald-500"
        case "in-use":
            return "bg-amber-500"
        default:
            return "bg-destructive"
    }
}
