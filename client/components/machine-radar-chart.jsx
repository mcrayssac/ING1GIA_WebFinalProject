"use client"

import { motion } from "framer-motion"

export const RadarChart = ({ data = [], className }) => {
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
    const pathData = points.length > 0 ? points.map((point, i) => `${i === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ") + "Z" : ""

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