"use client"

import { motion } from "framer-motion"
import { Info, CheckCircle, Clock, XCircle } from "lucide-react"

export const StatusBadge = ({ status }) => {
    let bgColor, textColor, icon

    switch (status) {
        case "available":
            bgColor = "bg-green-100"
            textColor = "text-green-800"
            icon = <CheckCircle className="w-3 h-3 mr-1" />
            break
        case "in-use":
            bgColor = "bg-yellow-100"
            textColor = "text-yellow-800"
            icon = <Clock className="w-3 h-3 mr-1" />
            break
        case "blocked":
            bgColor = "bg-red-100"
            textColor = "text-red-800"
            icon = <XCircle className="w-3 h-3 mr-1" />
            break
        default:
            bgColor = "bg-gray-100"
            textColor = "text-gray-800"
            icon = <Info className="w-3 h-3 mr-1" />
    }

    return (
        <motion.span
            className={`inline-flex items-center px-2 py-1 ${bgColor} ${textColor} rounded-full text-xs font-medium`}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
        >
            {icon}
            {status}
        </motion.span>
    )
}

export const AnimatedBadge = ({ children, color = "blue", icon }) => {
    const colors = {
        blue: "bg-blue-100 text-blue-800",
        gray: "bg-gray-100 text-gray-800",
        purple: "bg-purple-100 text-purple-800",
        green: "bg-green-100 text-green-800",
        yellow: "bg-yellow-100 text-yellow-800",
        red: "bg-red-100 text-red-800",
    }

    return (
        <motion.span
            className={`inline-flex items-center px-2 py-1 ${colors[color]} rounded-full text-xs font-medium`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
        >
            {icon && <span className="mr-1">{icon}</span>}
            {children}
        </motion.span>
    )
}