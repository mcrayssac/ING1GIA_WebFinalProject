"use client"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

/**
 * PulseIndicator component creates a pulsing animation effect
 *
 * @param {Object} props - Component props
 * @param {string} [props.color='primary'] - Color variant of the pulse (primary, success, warning, danger, info)
 * @param {string} [props.size='md'] - Size of the pulse indicator (sm, md, lg)
 * @param {number} [props.intensity=1] - Intensity of the pulse animation (0.5 to 2)
 * @param {number} [props.speed=1] - Speed of the pulse animation (0.5 to 2)
 * @param {boolean} [props.active=true] - Whether the pulse is active
 * @param {string} [props.className] - Additional CSS classes
 */
export function PulseIndicator({
    color = "primary",
    size = "md",
    intensity = 1,
    speed = 1,
    active = true,
    className,
    ...props
}) {
    // Map color to actual color values
    const colorMap = {
        primary: "bg-blue-500",
        success: "bg-green-500",
        warning: "bg-amber-500",
        danger: "bg-red-500",
        info: "bg-cyan-500",
        purple: "bg-purple-500",
        pink: "bg-pink-500",
        orange: "bg-orange-500",
    }

    // Map size to dimensions
    const sizeMap = {
        xs: "h-1.5 w-1.5",
        sm: "h-2 w-2",
        md: "h-3 w-3",
        lg: "h-4 w-4",
        xl: "h-5 w-5",
    }

    // Calculate animation duration based on speed
    const duration = 2 / speed

    return (
        <div className={cn("relative flex items-center justify-center", className)} {...props}>
            {/* Core indicator */}
            <span
                className={cn(
                    "rounded-full",
                    colorMap[color] || "bg-blue-500",
                    sizeMap[size] || "h-3 w-3",
                    active ? "opacity-100" : "opacity-40",
                )}
            />

            {/* Pulse animations - only render if active */}
            {active && (
                <>
                    <motion.span
                        className={cn("absolute rounded-full", colorMap[color] || "bg-blue-500", sizeMap[size] || "h-3 w-3")}
                        animate={{
                            scale: [1, 1 + intensity * 1.5],
                            opacity: [0.8, 0],
                        }}
                        transition={{
                            duration: duration,
                            ease: "easeOut",
                            repeat: Number.POSITIVE_INFINITY,
                            repeatDelay: 0.2,
                        }}
                    />
                    <motion.span
                        className={cn("absolute rounded-full", colorMap[color] || "bg-blue-500", sizeMap[size] || "h-3 w-3")}
                        animate={{
                            scale: [1, 1 + intensity * 2],
                            opacity: [0.6, 0],
                        }}
                        transition={{
                            duration: duration * 1.2,
                            ease: "easeOut",
                            repeat: Number.POSITIVE_INFINITY,
                            repeatDelay: 0.1,
                            delay: 0.3,
                        }}
                    />
                </>
            )}
        </div>
    )
}

/**
 * LiveIndicator component combines a PulseIndicator with a label
 */
export function LiveIndicator({ label = "Live", className, ...props }) {
    return (
        <div className={cn("flex items-center gap-1.5", className)}>
            <PulseIndicator color="danger" size="sm" {...props} />
            <span className="text-xs font-medium">{label}</span>
        </div>
    )
}

/**
 * StatusPulse component shows a status with appropriate color
 */
export function StatusPulse({ status, className, ...props }) {
    const statusMap = {
        online: { color: "success", label: "Online" },
        offline: { color: "danger", label: "Offline" },
        maintenance: { color: "warning", label: "Maintenance" },
        warning: { color: "warning", label: "Warning" },
        standby: { color: "info", label: "Standby" },
    }

    const { color, label } = statusMap[status] || statusMap.offline

    return (
        <div className={cn("flex items-center gap-1.5", className)} {...props}>
            <PulseIndicator color={color} size="sm" />
            <span className="text-xs font-medium">{label}</span>
        </div>
    )
}
