"use client";

import React from "react";
import * as Icons from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.3
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: align => align === "start" ? -50 : 50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 10
        }
    }
};

const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
        scale: 1,
        rotate: 0,
        transition: {
            type: "spring",
            stiffness: 200,
            damping: 15
        }
    },
    hover: {
        scale: 1.2,
        rotate: 360,
        transition: {
            duration: 0.3
        }
    }
};

const lineVariants = {
    hidden: { scaleY: 0 },
    visible: {
        scaleY: 1,
        transition: {
            duration: 0.5
        }
    }
};

function TimelineItem({ event, align }) {
    const IconComponent = Icons[event.icon] || Icons.CircleCheckBig;

    return (
        <motion.li
            variants={itemVariants}
            custom={align}
            whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
            }}
        >
            <motion.div 
                className="timeline-middle text-secondary"
                variants={iconVariants}
                whileHover="hover"
            >
                <IconComponent className="w-8 h-8 p-1" />
            </motion.div>
            <motion.div 
                className={`timeline-${align} mb-10 md:text-${align === "start" ? "end" : "start"}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <motion.time
                    className="font-mono italic text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {event.date}
                </motion.time>
                <motion.div
                    className="text-lg font-black font-mono text-secondary"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    {event.title}
                </motion.div>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    {event.description}
                </motion.p>
            </motion.div>
            <motion.hr variants={lineVariants} />
        </motion.li>
    );
}

export default function TimelinePage({ historyEvents }) {
    return (
        <motion.ul 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical mt-12"
        >
            {historyEvents.map((event, index) => (
                <TimelineItem key={event._id} event={event} align={index % 2 === 0 ? "start" : "end"} />
            ))}
        </motion.ul>
    );
}
