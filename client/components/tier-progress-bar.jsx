"use client"
import { Trophy, Star, Award, Crown, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import React, { useState, useEffect, useMemo } from "react";
import { useToastAlert } from "@/contexts/ToastContext";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
            duration: 0.5, 
            ease: "easeOut",
            when: "beforeChildren",
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3 }
    }
};

const progressBarVariants = {
    hidden: { width: 0 },
    visible: width => ({
        width: `${width}%`,
        transition: { 
            duration: 1, 
            ease: "easeOut",
            delay: 0.3
        }
    })
};

const tierIconVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
        scale: 1, 
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 260,
            damping: 20
        }
    },
    hover: { 
        scale: 1.2, 
        rotate: [0, 5, -5, 0],
        transition: { 
            duration: 0.5,
            ease: "easeInOut"
        } 
    }
};

const pulseVariants = {
    pulse: {
        scale: [1, 1.05, 1],
        opacity: [0.8, 1, 0.8],
        transition: {
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
        }
    }
};

const TierProgressBar = ({ currentPoints = 0, currentGrade = null }) => {
    const [tiers, setTiers] = useState([]);
    const iconMapping = {
        Trophy: Trophy,
        Star: Star,
        Award: Award,
        Crown: Crown,
    };

    const { toastSuccess, toastError } = useToastAlert();

    // Calculate the width of the filled progress bar
    const calculateProgressWidth = (currentPoints, tiers) => {
        if (tiers.length === 0) return 0;
        const maxPoints = tiers[tiers.length - 1].threshold;
        return Math.min(100, (currentPoints / maxPoints) * 100);
    };

    const progressWidth = useMemo(
        () => calculateProgressWidth(currentPoints, tiers),
        [currentPoints, tiers]
    );

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/grades`, {
                    method: "GET",
                    credentials: "include",
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message);
                const fetchedTiers = data.map((grade) => ({
                    name: grade.name,
                    threshold: grade.cap,
                    icon: iconMapping[grade.icon] || Trophy,
                    color: grade.color,
                }));
                setTiers(fetchedTiers);
            } catch (error) {
                console.error("Error fetching grades:", error);
                toastError("Failed to fetch grades", { description: error.message });
            }
        };
        fetchGrades();
    }, []);

    if (tiers.length === 0) {
        return (
            <motion.div
                initial="hidden"
                animate="visible"
                variants={cardVariants}
            >
                <Card className="w-full shadow-lg">
                    <CardContent className="p-6">
                        <div className="text-center flex flex-col items-center gap-4">
                            <motion.div
                                animate={{ 
                                    rotate: 360,
                                }}
                                transition={{ 
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                            >
                                <Trophy className="h-8 w-8 text-muted-foreground" />
                            </motion.div>
                            <span>Loading tier data...</span>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }
    
    // Find the next tier after current grade
    const findNextTier = () => {
        if (!currentGrade || !tiers.length) return null;
        const currentIndex = tiers.findIndex(tier => tier.name === currentGrade.name);
        return currentIndex >= 0 && currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
    }

    const currentTier = currentGrade ? {
        name: currentGrade.name,
        threshold: currentGrade.cap,
        icon: iconMapping[currentGrade.icon] || Trophy,
        color: currentGrade.color
    } : tiers[0];
    const nextTier = findNextTier();

    // Calculate progress percentage
    const calculateProgress = () => {
        if (!nextTier) return 100 // Already at max tier

        const currentTierPoints = currentTier.threshold
        const nextTierPoints = nextTier.threshold
        const pointsInCurrentTier = currentPoints - currentTierPoints
        const pointsNeededForNextTier = nextTierPoints - currentTierPoints

        return Math.min(100, Math.round((pointsInCurrentTier / pointsNeededForNextTier) * 100))
    }

    const progressPercentage = calculateProgress()

    // Calculate the position of each tier marker on the progress bar
    const calculateTierPosition = (tierIndex) => {
        if (tierIndex === 0) return 0
        if (tierIndex === tiers.length - 1) return 100

        const maxPoints = tiers[tiers.length - 1].threshold
        return (tiers[tierIndex].threshold / maxPoints) * 100
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={cardVariants}
        >
            <Card className="w-full shadow-lg">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                        <motion.div variants={itemVariants}>
                            <CardTitle className="text-xl">Your Progress</CardTitle>
                            <CardDescription>
                                {nextTier
                                    ? currentPoints >= nextTier.threshold
                                        ? `Ready to upgrade to ${nextTier.name} tier`
                                        : `${nextTier.threshold - currentPoints} points until ${nextTier.name} tier`
                                    : "You've reached the highest tier!"}
                            </CardDescription>
                        </motion.div>
                        <motion.div 
                            className="flex items-center gap-2"
                            variants={itemVariants}
                            animate={currentPoints >= (nextTier?.threshold || 0) ? "pulse" : "visible"}
                            whileHover={{ scale: 1.05 }}
                        >
                            <motion.span 
                                className="text-2xl font-bold"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                            >
                                {currentPoints}
                            </motion.span>
                            <span className="text-muted-foreground">points</span>
                        </motion.div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Current Tier Display */}
                    <motion.div 
                        className="flex items-center gap-3 mb-6"
                        variants={itemVariants}
                    >
                        <motion.div 
                            className="p-2 rounded-full" 
                            style={{ backgroundColor: `${currentTier.color}20` }}
                            variants={tierIconVariants}
                            whileHover="hover"
                        >
                            <currentTier.icon className="h-6 w-6" style={{ color: currentTier.color }} />
                        </motion.div>
                        <div>
                            <motion.p 
                                className="font-bold"
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                            >
                                {currentTier.name} Tier
                            </motion.p>
                            <motion.p 
                                className="text-sm text-muted-foreground"
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.3, delay: 0.3 }}
                            >
                                {nextTier ? `${progressPercentage}% progress to ${nextTier.name}` : "Maximum tier achieved"}
                            </motion.p>
                        </div>
                    </motion.div>

                    {/* Progress Bar */}
                    <motion.div 
                        className="relative h-8 bg-muted rounded-full mb-2 overflow-hidden"
                        variants={itemVariants}
                    >
                        {/* Filled Progress */}
                        <motion.div
                            className="absolute h-full rounded-full"
                            style={{
                                background: `linear-gradient(to right, ${currentTier.color}, ${nextTier ? nextTier.color : currentTier.color})`,
                            }}
                            custom={progressWidth}
                            variants={progressBarVariants}
                        />

                        {/* Tier Markers */}
                        <TooltipProvider>
                            <div className="absolute inset-0 pointer-events-none">
                                {tiers.map((tier, index) => (
                                    <Tooltip key={tier.name}>
                                        <TooltipTrigger asChild>
                                            <motion.div
                                                className={`absolute top-0 bottom-0 flex items-center justify-center ${index === 0 ? "left-0" : ""} pointer-events-auto`}
                                                style={{
                                                    left: `${calculateTierPosition(index)}%`,
                                                    transform: index === 0 ? "translateX(0)" : "translateX(-50%)",
                                                    zIndex: 10,
                                                }}
                                                initial={{ opacity: 0, scale: 0 }}
                                                animate={{ 
                                                    opacity: 1, 
                                                    scale: 1,
                                                    transition: { delay: 0.5 + (index * 0.1) }
                                                }}
                                                whileHover={{ scale: 1.2 }}
                                            >
                                                <motion.div
                                                    className={`h-8 w-1 ${currentPoints >= tier.threshold ? "bg-background" : "bg-muted-foreground"}`}
                                                    animate={currentPoints >= tier.threshold && {
                                                        backgroundColor: ["rgba(255,255,255,0.7)", "rgba(255,255,255,1)", "rgba(255,255,255,0.7)"]
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        repeatType: "reverse"
                                                    }}
                                                />
                                            </motion.div>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                            <div className="text-center">
                                                <p className="font-bold">{tier.name}</p>
                                                <p className="text-xs">{tier.threshold} points</p>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        </TooltipProvider>
                    </motion.div>

                    {/* Tier Labels */}
                    <motion.div 
                        className="flex justify-between mt-2"
                        variants={itemVariants}
                    >
                        {tiers.map((tier, index) => (
                            <motion.div
                                key={tier.name}
                                className={`flex flex-col items-center ${index === 0 ? "items-start" : index === tiers.length - 1 ? "items-end" : "items-center"}`}
                                style={{
                                    width: index === 0 || index === tiers.length - 1 ? "auto" : "1px",
                                    flex: index === 0 || index === tiers.length - 1 ? "0 0 auto" : "1",
                                }}
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 + (index * 0.1) }}
                            >
                                <motion.div
                                    className="flex items-center justify-center rounded-full p-1 mb-1"
                                    style={{
                                        backgroundColor: currentPoints >= tier.threshold ? `${tier.color}20` : "transparent",
                                    }}
                                    whileHover={{ scale: 1.2, rotate: 5 }}
                                    variants={tierIconVariants}
                                >
                                    <tier.icon
                                        className="h-4 w-4"
                                        style={{
                                            color: currentPoints >= tier.threshold ? tier.color : "var(--muted-foreground)",
                                        }}
                                    />
                                </motion.div>
                                <span className={`text-xs ${currentPoints >= tier.threshold ? "font-bold" : "text-muted-foreground"}`}>
                                    {tier.name}
                                </span>
                                <span className="text-xs text-muted-foreground">{tier.threshold}</span>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Next Tier Info and Upgrade Button */}
                    {nextTier && (
                        <AnimatePresence>
                            <motion.div 
                                variants={itemVariants}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="mt-6 p-3 bg-muted/20 rounded-lg flex items-center justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <motion.div
                                        animate={currentPoints >= nextTier.threshold ? pulseVariants.pulse : {}}
                                        whileHover={{ scale: 1.1, rotate: [0, 10, -10, 0] }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <nextTier.icon className="h-5 w-5" style={{ color: nextTier.color }} />
                                    </motion.div>
                                    <span>
                                        Next: <strong>{nextTier.name} Tier</strong>
                                    </span>
                                </div>
                                <motion.div 
                                    className="text-sm"
                                    animate={currentPoints >= nextTier.threshold ? pulseVariants.pulse : {}}
                                >
                                    {currentPoints >= nextTier.threshold
                                        ? <span className="font-bold">Ready to upgrade!</span>
                                        : <span><span className="font-bold">{nextTier.threshold - currentPoints}</span> points needed</span>
                                    }
                                </motion.div>
                            </motion.div>

                            {currentPoints >= nextTier.threshold && (
                                <motion.button
                                    onClick={async () => {
                                        try {
                                            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/tickets`, {
                                                method: "POST",
                                                credentials: "include",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                },
                                                body: JSON.stringify({
                                                    type: "GRADE_UPGRADE",
                                                    targetGrade: nextTier.name,
                                                }),
                                            });
                                            
                                            if (!response.ok) {
                                                const error = await response.json();
                                                throw new Error(error.message);
                                            }
                                            
                                            toastSuccess("Upgrade request created successfully", { description: "An administrator will review your request." });                            
                                        } catch (error) {
                                            toastError("Failed to create ticket", { description: error.message });
                                            console.error(error);
                                        }
                                    }}
                                    className="mt-4 w-full p-3 bg-muted/20 rounded-lg flex items-center justify-center gap-2 text-sm hover:bg-muted/30 transition-colors"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ 
                                        opacity: 1, 
                                        y: 0,
                                        transition: { delay: 0.8 } 
                                    }}
                                    whileHover={{ 
                                        scale: 1.02,
                                        backgroundColor: "rgba(var(--muted), 0.3)"
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <motion.div
                                        animate={{ 
                                            rotate: [0, 10, -10, 0],
                                            scale: [1, 1.1, 1] 
                                        }}
                                        transition={{ 
                                            duration: 2,
                                            repeat: Infinity,
                                            repeatDelay: 1
                                        }}
                                    >
                                        <Sparkles className="h-5 w-5" style={{ color: nextTier.color }} />
                                    </motion.div>
                                    <span>Request Upgrade to <strong>{nextTier.name}</strong></span>
                                </motion.button>
                            )}
                        </AnimatePresence>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}

export default TierProgressBar
