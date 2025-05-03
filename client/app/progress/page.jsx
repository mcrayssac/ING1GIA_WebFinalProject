"use client"

import { useUser } from "@/contexts/UserContext"
import TierProgressBar from "@/components/tier-progress-bar"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Shield, Loader2, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

// Animation variants for page components
const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { 
            duration: 0.5,
            ease: "easeOut"
        }
    }
}

const slideUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
            duration: 0.5,
            ease: "easeOut"
        }
    }
}

const containerAnimation = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: {
            when: "beforeChildren",
            staggerChildren: 0.2,
            duration: 0.3
        }
    }
}

const loadingAnimation = {
    rotate: {
        rotate: 360,
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
        }
    }
}

export default function ProgressPage() {
    const { user } = useUser()
    const router = useRouter()

    useEffect(() => {
        if (user === false) {
            router.replace('/')
            return
        }
        // Redirect admins to the tickets page
        if (user?.admin) {
            router.replace('/tickets')
        }
    }, [user, router])

    // Show loading state while user context is initializing
    if (user === undefined) {
        return (
            <motion.div 
                className="flex items-center justify-center h-[calc(100vh-200px)]"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
            >
                <motion.div animate={loadingAnimation.rotate}>
                    <Loader2 className="h-8 w-8 text-muted-foreground" />
                </motion.div>
            </motion.div>
        )
    }

    // Show access denied if not authenticated
    if (user === false) {
        return (
            <motion.div 
                className="flex flex-col items-center justify-center h-[calc(100vh-200px)] p-4"
                initial="hidden"
                animate="visible"
                variants={containerAnimation}
            >
                <motion.div 
                    variants={slideUp}
                    whileHover={{ 
                        scale: 1.1, 
                        rotate: [0, 10, -10, 0],
                        transition: { duration: 0.5 }
                    }}
                >
                    <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                </motion.div>
                <motion.h2 
                    className="text-2xl font-bold mb-2"
                    variants={slideUp}
                >
                    Access Denied
                </motion.h2>
                <motion.p 
                    className="text-muted-foreground text-center"
                    variants={slideUp}
                >
                    Please log in to view your progress.
                </motion.p>
            </motion.div>
        )
    }

    // Show loading state while redirecting admin
    if (user?.admin) {
        return (
            <motion.div 
                className="flex items-center justify-center h-[calc(100vh-200px)]"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
            >
                <motion.div animate={loadingAnimation.rotate}>
                    <Loader2 className="h-8 w-8 text-muted-foreground" />
                </motion.div>
            </motion.div>
        )
    }

    return (
        <motion.div 
            className="container mx-auto px-4 py-8 h-full"
            initial="hidden"
            animate="visible"
            variants={containerAnimation}
        >
            <motion.div 
                className="mx-auto space-y-8 w-full"
                variants={slideUp}
            >
                <motion.div 
                    className="flex items-center justify-center gap-3"
                    variants={slideUp}
                    whileHover={{ scale: 1.02 }}
                >
                    <motion.div
                        animate={{
                            y: [0, -5, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "mirror"
                        }}
                    >
                        <TrendingUp className="h-8 w-8 text-primary" />
                    </motion.div>
                    <h1 className="text-3xl font-bold mb-0 text-center">Your Progress</h1>
                </motion.div>
                <TierProgressBar 
                    currentPoints={user.points} 
                    currentGrade={user.grade}
                />
            </motion.div>
        </motion.div>
    )
}
