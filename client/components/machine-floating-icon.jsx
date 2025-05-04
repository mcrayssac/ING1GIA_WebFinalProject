"use client"

import { motion } from "framer-motion"

export const FloatingIcon = ({ icon: Icon, delay = 0, className }) => {
    return (
        <motion.div
            className={`absolute ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: [0, 1, 0], y: [20, -20, 20] }}
            transition={{
                duration: 3,
                delay,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                times: [0, 0.5, 1],
                ease: "easeInOut",
            }}
        >
            <Icon className="h-4 w-4 text-primary/40" />
        </motion.div>
    )
}