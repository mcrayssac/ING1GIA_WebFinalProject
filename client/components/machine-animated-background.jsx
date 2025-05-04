"use client"

import { useEffect } from "react"
import { motion, useMotionValue } from "framer-motion"

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

export function AnimatedBackground({ children, className }) {
    return (
        <div className={`relative overflow-hidden ${className}`}>
            {Array.from({ length: 20 }).map((_, i) => (
                <Particle key={i} className="bg-primary/10" />
            ))}
            {children}
        </div>
    )
}
