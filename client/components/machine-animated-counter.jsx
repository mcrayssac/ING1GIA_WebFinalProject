"use client"

import { useEffect, useRef } from "react"
import { motion, useMotionValue, useTransform, useInView, animate as frameAnimate } from "framer-motion"

const animate = (value, target, options) => {
    return frameAnimate(value, target, options)
}

export const AnimatedCounter = ({ value, className }) => {
    const ref = useRef(null)
    const inView = useInView(ref, { once: false, margin: "-100px" })
    const count = useMotionValue(0)
    const rounded = useTransform(count, (latest) => Math.round(latest))
    const displayValue = useMotionValue(0)

    useEffect(() => {
        if (inView) {
            const animation = animate(count, value, {
                duration: 1.5,
                ease: "easeOut",
            })
            return () => animation.stop()
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