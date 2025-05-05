"use client"

import { motion } from "framer-motion"
import { Layers, ChevronRight, Lock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RadarChart } from "./machine-radar-chart"
import { AnimatedProgressBar } from "./machine-animated-progress-bar"
import { TiltCard } from "./machine-tilt-card"

export const MachineSensorsTab = ({ machine, sensorData, sensorLabels, userGradeLevel, isAdmin, gradeOrder, onSensorClick }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="backdrop-blur-sm bg-card border-border shadow-md mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                        <Layers className="h-5 w-5 text-primary-foreground" />
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
                                    <span className="text-muted-foreground">{label}</span>
                                    <span className="font-medium text-card-foreground">{sensorData[index]}%</span>
                                </div>
                                <AnimatedProgressBar value={sensorData[index]} max={100} />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-card border-border shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                        <Layers className="h-5 w-5 text-primary-foreground" />
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
                                            <Card className="backdrop-blur-sm bg-card border-border shadow-md h-full">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <motion.div
                                                                className={`h-10 w-10 rounded-full ${hasAccess ? "bg-gradient-to-br from-primary to-secondary" : "bg-muted"} flex items-center justify-center`}
                                                                whileHover={{ scale: hasAccess ? 1.1 : 1, rotate: hasAccess ? 5 : 0 }}
                                                            >
                                                                <Layers className={`h-5 w-5 ${hasAccess ? "text-primary" : "text-muted-foreground"}`} />
                                                            </motion.div>
                                                            <div>
                                                                <p className="font-medium text-card-foreground">{sensor.designation}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {hasAccess ? "Access granted" : "Access restricted"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {hasAccess ? (
                                                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                                <Button
                                                                    variant="secondary"
                                                                    size="icon"
                                                                    onClick={() => onSensorClick(sensor._id)}
                                                                    className="h-8 w-8 relative text-primary hover:text-primary"
                                                                    data-navigation="true"
                                                                >
                                                                    <ChevronRight className="h-4 w-4" />
                                                                    <motion.div
                                                                        className="absolute inset-0 bg-primary rounded-full"
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
                                                                    <TooltipContent className="bg-popover border-border text-popover-foreground">
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
    )
}