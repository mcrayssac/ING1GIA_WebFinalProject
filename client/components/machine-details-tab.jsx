"use client"

import { motion } from "framer-motion"
import { Tag, Settings, Activity, Zap, Award, Users, MapPin, Play, Unlock, Lock, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TiltCard } from "./machine-tilt-card"
import { AnimatedCounter } from "./machine-animated-counter"
import { AnimatedBadge } from "./machine-status-badge"
import { CircularProgress } from "./machine-circular-progress"
import { PulseIndicator } from "./machine-pulse-indicator"
import { useRouter } from "next/navigation"

export const MachineDetailsTab = ({ machine, canStartCycle, isAdmin, user, showSparkles, onStartCycle, onEmergencyStop, cycleProgress }) => {
    const router = useRouter()

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
            {/* Basic Information Card with 3D effect */}
            <TiltCard className="h-full">
                <Card className="h-full backdrop-blur-sm bg-card border-border shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-card-foreground">
                            <Tag className="h-5 w-5 text-primary-foreground" />
                            <span>Basic Information</span>
                        </CardTitle>
                        <CardDescription>Core details about this machine</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 relative">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Main Pole</p>
                                <motion.p
                                    className="font-medium text-card-foreground"
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
                                    className="font-medium text-card-foreground"
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
                                    className="font-medium text-card-foreground"
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
                                    className="font-medium text-card-foreground"
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
                                    className="font-medium text-card-foreground"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <AnimatedCounter value={machine.totalCycles} className="font-medium" />
                                </motion.p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TiltCard>

            {/* Location Card with 3D map effect */}
            <TiltCard>
                <Card className="h-full backdrop-blur-sm bg-card border-border shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-card-foreground">
                            <MapPin className="h-5 w-5 text-primary-foreground" />
                            <span>Location</span>
                        </CardTitle>
                        <CardDescription>Where this machine is installed</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <motion.div
                            className="p-6 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center h-40 relative overflow-hidden"
                            whileHover={{ scale: 1.02 }}
                        >
                            {/* Animated map grid background */}
                            <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
                                {Array.from({ length: 100 }).map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="border-[0.5px] border-primary"
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
                                    className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mx-auto mb-2"
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
                                    <MapPin className="h-6 w-6 text-primary-foreground" />
                                </motion.div>
                                <p className="text-lg font-medium text-card-foreground">{machine.sites[0]?.name || "No site assigned"}</p>
                                {machine.sites[0] && (
                                    <motion.p
                                        className="text-sm text-muted-foreground mt-1"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.7 }}
                                    >
                                        {machine.site.coordinates && (
                                            <p>
                                                <span className="text-sm font-medium">Latitude:</span> {machine.site.coordinates[0]}
                                                <br />
                                                <span className="text-sm font-medium">Longitude:</span> {machine.site.coordinates[1]}
                                            </p>
                                        ) || "No coordinates available"}
                                    </motion.p>
                                )}
                            </motion.div>
                        </motion.div>
                    </CardContent>
                    <CardFooter>
                        <div className="w-full flex flex-col gap-2">
                            {machine.sites[0] && machine.sites[0]._id && (
                                <Button
                                    variant="default"
                                    className="w-full flex items-center justify-center gap-2 border border-primary-foreground"
                                    onClick={() => router.push(`/map/${machine.sites[0]._id}`)}
                                    data-navigation="true"
                                >
                                    <MapPin className="h-4 w-4" />
                                    <span>View in Site Map</span>
                                </Button>
                            )}
                            {machine.sites[0] && machine.sites[0].coordinates && (
                                <Button
                                    variant="secondary"
                                    className="w-full flex items-center justify-center gap-2"
                                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${machine.sites[0].coordinates[0]},${machine.sites[0].coordinates[1]}`, "_blank")}
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    <span>Google Maps</span>
                                </Button>
                            )}
                        </div>
                    </CardFooter>
                </Card>
            </TiltCard>

            {/* Current Users Card with animated avatars */}
            <TiltCard>
                <Card className="h-full backdrop-blur-sm bg-card border-border shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-card-foreground">
                            <Users className="h-5 w-5 text-primary-foreground" />
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
                                        className="flex items-center justify-between p-3 bg-muted rounded-md"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <motion.div
                                                className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                            >
                                                <Users className="h-5 w-5 text-primary" />
                                            </motion.div>
                                            <span className="font-medium text-card">{user.username || `User ${index + 1}`}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                                                Active
                                            </Badge>
                                            <Button
                                                variant="secondary"
                                                className="h-8 w-8"
                                                onClick={() => router.push(`/users`)}
                                                data-navigation="true"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
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
                <Card className="h-full backdrop-blur-sm bg-card border-border shadow-md relative overflow-hidden">
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
                        <CardTitle className="flex items-center gap-2 text-card-foreground">
                            <Activity className="h-5 w-5 text-primary-foreground" />
                            <span>Machine Control</span>
                        </CardTitle>
                        <CardDescription>Start a cycle or manage this machine</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 relative">
                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                            <PulseIndicator
                                color={
                                    machine.status === "available"
                                        ? "bg-emerald-500"
                                        : machine.status === "in-use"
                                            ? "bg-amber-500"
                                            : "bg-red-500"
                                }
                                size="h-4 w-4"
                            />
                            <span className="text-card">
                                {machine.status === "available"
                                    ? "Machine is available for use"
                                    : machine.status === "in-use"
                                        ? "Machine is currently in use"
                                        : "Machine is blocked"}
                            </span>
                        </div>

                        <div className="flex justify-center relative">
                            {user && machine.currentUsers?.some(u => String(u._id) === String(user._id)) ? (
                                <div className="flex flex-col items-center gap-4">
                                    <CircularProgress value={cycleProgress} max={100} size={100}>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-sm font-medium">{Math.round(cycleProgress)}%</span>
                                        </div>
                                    </CircularProgress>
                                    <Button 
                                        variant="secondary"
                                        onClick={onEmergencyStop}
                                        className="flex items-center gap-2"
                                    >
                                        <Zap className="h-4 w-4" />
                                        Emergency Stop
                                    </Button>
                                </div>
                            ) : (
                                <CircularProgress value={machine.totalCycles} max={1000} size={100}>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-sm font-medium">{machine.totalCycles}</span>
                                    </div>
                                </CircularProgress>
                            )}
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
                                                onClick={onStartCycle}
                                                className="w-full flex items-center justify-center gap-2 h-12 relative overflow-hidden"
                                                disabled={!canStartCycle || (machine.status !== "available" && machine.status !== "in-use") || machine.currentUsers.length >= machine.maxUsers}
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
                                                        : machine.status !== "available" && machine.status !== "in-use"
                                                            ? "Machine unavailable"
                                                            : machine.currentUsers.length >= machine.maxUsers
                                                                ? "Machine at capacity"
                                                                : "Start cycle"}
                                                </span>
                                            </Button>
                                        </motion.div>

                                        {/* Animated glow effect for the button */}
                                        {canStartCycle && (machine.status === "available" || machine.status === "in-use") && machine.currentUsers.length < machine.maxUsers && (
                                            <motion.div
                                                className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-lg blur-md -z-10"
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
                                <TooltipContent className="bg-popover border-border text-popover-foreground">
                                    {!canStartCycle
                                        ? `You need ${machine.requiredGrade} grade or higher to use this machine`
                                        : machine.status !== "available" && machine.status !== "in-use" 
                                            ? "Machine must be available to start a cycle"
                                            : machine.currentUsers.length >= machine.maxUsers
                                                ? "Machine has reached maximum user capacity"
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
                                        <Unlock className="h-3 w-3 text-emerald-500" />
                                    </motion.div>
                                ) : (
                                    <Lock className="h-3 w-3 text-red-500" />
                                )}
                                <span>Access level: {user?.grade?.name || "Unknown"}</span>
                            </div>
                            <span>Required: {machine.requiredGrade}</span>
                        </div>
                    </CardContent>
                </Card>
            </TiltCard>
        </motion.div>
    )
}
