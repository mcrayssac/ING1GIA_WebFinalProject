"use client";

import React, { useEffect, useState } from 'react';
import { Rocket } from 'lucide-react';
import { motion } from "framer-motion";
import Link from "next/link";

const countdownVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: {
            duration: 0.6,
            staggerChildren: 0.1
        }
    }
};

const numberVariants = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: { 
        scale: 1, 
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 200,
            damping: 10
        }
    }
};

const titleVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { 
        opacity: 1, 
        y: 0,
        scale: [1, 1.1, 1],
        transition: {
            duration: 1,
            repeatType: "reverse",
            ease: "easeInOut"
        }
    }
};

export default function Countdown({ targetDate }) {
    const textColor = "text-blue-50";

    // Helper function to calculate remaining time
    const getTimeLeft = (date) => {
        const now = new Date();
        const diff = date.getTime() - now.getTime();
        if (diff <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        return { days, hours, minutes, seconds };
    };

    const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate));

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(getTimeLeft(targetDate));
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    return (
        <motion.div
            variants={countdownVariants}
            initial="hidden"
            animate="visible" 
            className={`flex flex-col items-center space-y-4 ${textColor}`}
        >
            <motion.h1
                variants={titleVariants}
                className="font-mono leading-none lg:text-6xl md:text-4xl sm:text-2xl text-xl line-clamp-1"
            >
                Our next adventure begins in
            </motion.h1>

            <motion.div 
                variants={countdownVariants}
                className="grid grid-flow-col gap-5 text-centerfont-mono auto-cols-max"
            >
                <motion.div 
                    className="flex flex-col items-center"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                >
                    <motion.span 
                        variants={numberVariants}
                        className="countdown font-mono lg:text-8xl md:text-6xl sm:text-4xl text-2xl"
                    >
                        <span style={{ "--value": timeLeft.days }}></span>
                    </motion.span>
                    <motion.span variants={numberVariants}>days</motion.span>
                </motion.div>
                <motion.div 
                    className="flex flex-col items-center"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                >
                    <motion.span 
                        variants={numberVariants}
                        className="countdown font-mono lg:text-8xl md:text-6xl sm:text-4xl text-2xl"
                    >
                        <span style={{ "--value": timeLeft.hours }}></span>
                    </motion.span>
                    <motion.span variants={numberVariants}>hours</motion.span>
                </motion.div>
                <motion.div 
                    className="flex flex-col items-center"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                >
                    <motion.span 
                        variants={numberVariants}
                        className="countdown font-mono lg:text-8xl md:text-6xl sm:text-4xl text-2xl"
                    >
                        <span style={{ "--value": timeLeft.minutes }}></span>
                    </motion.span>
                    <motion.span variants={numberVariants}>min</motion.span>
                </motion.div>
                <motion.div 
                    className="flex flex-col items-center"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                >
                    <motion.span 
                        variants={numberVariants}
                        className="countdown font-mono lg:text-8xl md:text-6xl sm:text-4xl text-2xl"
                    >
                        <span style={{ "--value": timeLeft.seconds }}></span>
                    </motion.span>
                    <motion.span variants={numberVariants}>sec</motion.span>
                </motion.div>
            </motion.div>

            <Link href="/news" className="no-underline hover:no-underline">
                <motion.div 
                    className="flex items-center lg:space-x-4 md:space-x-3 space-x-2"
                    whileHover={{ 
                        scale: 1.1,
                        textShadow: "0 0 8px rgb(255,255,255)"
                    }}
                    transition={{ type: "spring", stiffness: 400 }}
                >
                    <motion.div
                        animate={{ 
                            rotate: 360,
                            y: [0, -5, 0]
                        }}
                        transition={{
                            rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                            y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                        }}
                    >
                        <Rocket className="lg:w-6 lg:h-6 md:w-5 md:h-5 sm:w-4 sm:h-4 w-3 h-3" />
                    </motion.div>
                    <motion.span 
                        variants={numberVariants}
                        className="font-mono lg:text-2xl md:text-xl sm:text-lg text-sm"
                        whileHover={{
                            color: "#ffffff",
                            transition: { duration: 0.2 }
                        }}
                    >
                        Blast off!
                    </motion.span>
                </motion.div>
            </Link>
        </motion.div>
    );
};
