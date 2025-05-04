"use client"

import { useRef, useState } from "react"
import { motion, useSpring } from "framer-motion"

export const TiltCard = ({ children, className }) => {
    const cardRef = useRef(null)
    const [rotateX, setRotateX] = useState(0)
    const [rotateY, setRotateY] = useState(0)
    const [scale, setScale] = useState(1)

    const handleMouseMove = (e) => {
        if (!cardRef.current) return
        const card = cardRef.current
        const rect = card.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const posX = e.clientX - centerX
        const posY = e.clientY - centerY
        const rotateXValue = (posY / (rect.height / 2)) * -5
        const rotateYValue = (posX / (rect.width / 2)) * 5
        setRotateX(rotateXValue)
        setRotateY(rotateYValue)
        setScale(1.02)
    }

    const handleMouseLeave = () => {
        setRotateX(0)
        setRotateY(0)
        setScale(1)
    }

    const springConfig = { stiffness: 300, damping: 30 }
    const springRotateX = useSpring(rotateX, springConfig)
    const springRotateY = useSpring(rotateY, springConfig)
    const springScale = useSpring(scale, springConfig)

    return (
        <motion.div
            ref={cardRef}
            className={`${className} relative perspective-1000 transform-gpu`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX: springRotateX,
                rotateY: springRotateY,
                scale: springScale,
                transformStyle: "preserve-3d",
            }}
        >
            <div className="relative z-10 h-full">{children}</div>
            <div
                className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"
                style={{ transform: "translateZ(-10px)" }}
            />
        </motion.div>
    )
}