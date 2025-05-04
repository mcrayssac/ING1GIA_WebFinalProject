"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Cpu, ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { StatusBadge } from "@/components/machine-detail-status-badge"
import { PulseIndicator } from "@/components/machine-detail-pulse-indicator"

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
}

export function MachineHeader({ machine, isRefreshing, onRefresh }) {
    return (
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
                                    onClick={onRefresh}
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
    )
}
