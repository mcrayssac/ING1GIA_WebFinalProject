"use client";

import React from "react";
import * as Icons from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            delayChildren: 0.3,
            staggerChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 10
        }
    }
};

const iconVariants = {
    initial: { scale: 1 },
    animate: { 
        scale: [1, 1.2, 1],
        rotate: [0, 10, -10, 0],
        transition: {
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
        }
    }
};

function StatItem({ icon, title, value, iconValue, desc }) {
    const Icon = Icons[icon] || Icons.Atom;
    const IconValue = Icons[iconValue] || Icons.Atom;

    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ 
                scale: 1.02,
                transition: { type: "spring", stiffness: 300 }
            }}
            className="stat relative"
        >
            <motion.div 
                className="stat-figure text-accent-foreground"
                variants={iconVariants}
                initial="initial"
                animate="animate"
            >
                <Icon className="w-8 h-8" />
            </motion.div>
            <motion.div 
                className="stat-title text-primary-content"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
                {title}
            </motion.div>
            <motion.div 
                className="stat-value text-accent-foreground"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
                {value}
            </motion.div>
            <motion.div 
                className="stat-desc text-primary-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <div className="flex items-center space-x-2">
                    <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                    >
                        <IconValue className="w-4 h-4" />
                    </motion.div>
                    <span>{desc}</span>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function StatsPage({ statsData }) {
    return (
        <div className="flex items-center justify-center">
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="stats stats-vertical lg:stats-horizontal shadow-xl m-8 mx-auto bg-primary relative"
                style={{ overflow: 'hidden' }}
            >
                {statsData.map((stat) => (
                    <StatItem key={stat._id} {...stat} />
                ))}
            </motion.div>
        </div>
    );
}
