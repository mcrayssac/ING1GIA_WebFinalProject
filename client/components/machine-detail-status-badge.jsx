"use client"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const statusConfig = {
    online: {
        color: "bg-green-500",
        textColor: "text-green-500",
        shadowColor: "shadow-green-500/20",
        pulseColor: "rgba(34, 197, 94, 0.6)",
        label: "Online",
    },
    offline: {
        color: "bg-red-500",
        textColor: "text-red-500",
        shadowColor: "shadow-red-500/20",
        pulseColor: "rgba(239, 68, 68, 0.6)",
        label: "Offline",
    },
    maintenance: {
        color: "bg-amber-500",
        textColor: "text-amber-500",
        shadowColor: "shadow-amber-500/20",
        pulseColor: "rgba(245, 158, 11, 0.6)",
        label: "Maintenance",
    },
    warning: {
        color: "bg-orange-500",
        textColor: "text-orange-500",
        shadowColor: "shadow-orange-500/20",
        pulseColor: "rgba(249, 115, 22, 0.6)",
        label: "Warning",
    },
    standby: {
        color: "bg-blue-500",
        textColor: "text-blue-500",
        shadowColor: "shadow-blue-500/20",
        pulseColor: "rgba(59, 130, 246, 0.6)",
        label: "Standby",
    },
}

export function StatusBadge({ status = "offline", className, showLabel = true, size = "md" }) {
    const config = statusConfig[status] || statusConfig.offline

    const sizeClasses = {
        sm: "h-2 w-2",
        md: "h-3 w-3",
        lg: "h-4 w-4",
    }

    const containerSizeClasses = {
        sm: "text-xs py-0.5 px-2",
        md: "text-sm py-1 px-3",
        lg: "text-base py-1.5 px-4",
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/10 backdrop-blur-sm",
                config.shadowColor,
                containerSizeClasses[size],
                "transition-all duration-300 hover:shadow-lg",
                className,
            )}
        >
            <div className="relative">
                <div className={cn("rounded-full", config.color, sizeClasses[size])} />
                <motion.div
                    className={cn("absolute top-0 left-0 rounded-full", sizeClasses[size])}
                    style={{
                        boxShadow: `0 0 0 4px ${config.pulseColor}`,
                    }}
                    animate={{
                        opacity: [0.7, 0, 0.7],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    }}
                />
            </div>
            {showLabel && <span className={cn("font-medium", config.textColor)}>{config.label}</span>}
        </motion.div>
    )
}
