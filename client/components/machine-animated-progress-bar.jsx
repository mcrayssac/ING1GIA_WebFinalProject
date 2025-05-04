"use client"

import { useEffect, useRef } from "react"
import { motion, useMotionValue, useInView, animate as frameAnimate } from "framer-motion"

export const AnimatedProgressBar = ({ value, max, className }) => {
    const percentage = (value / max) * 100
    const scaleX = useMotionValue(0)
    const ref = useRef(null)
    const inView = useInView(ref, { once: false })

    useEffect(() => {
        if (inView) {
            const animation = animate(scaleX, percentage / 100, {
                duration: 1,
                ease: "easeOut",
            })
            return () => animation.stop()
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

const animate = (value, target, options) => {
    return frameAnimate(value, target, options)
}