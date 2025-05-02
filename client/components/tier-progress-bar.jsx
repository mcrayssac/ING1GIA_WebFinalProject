"use client"
import { Trophy, Star, Award, Crown, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import React, { useState, useEffect, useMemo } from "react";
import { useToastAlert } from "@/contexts/ToastContext";

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
            <Card className="w-full shadow-lg">
                <CardContent className="p-6">
                    <div className="text-center">Loading tier data...</div>
                </CardContent>
            </Card>
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
        <Card className="w-full shadow-lg">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-xl">Your Progress</CardTitle>
                        <CardDescription>
                            {nextTier
                                ? currentPoints >= nextTier.threshold
                                    ? `Ready to upgrade to ${nextTier.name} tier`
                                    : `${nextTier.threshold - currentPoints} points until ${nextTier.name} tier`
                                : "You've reached the highest tier!"}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{currentPoints}</span>
                        <span className="text-muted-foreground">points</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Current Tier Display */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-full" style={{ backgroundColor: `${currentTier.color}20` }}>
                        <currentTier.icon className="h-6 w-6" style={{ color: currentTier.color }} />
                    </div>
                    <div>
                        <p className="font-bold">{currentTier.name} Tier</p>
                        <p className="text-sm text-muted-foreground">
                            {nextTier ? `${progressPercentage}% progress to ${nextTier.name}` : "Maximum tier achieved"}
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-8 bg-muted rounded-full mb-2 overflow-hidden">
                    {/* Filled Progress */}
                    <div
                        className="absolute h-full transition-all duration-500 ease-in-out rounded-full"
                        style={{
                            width: `${progressWidth}%`,
                            background: `linear-gradient(to right, ${currentTier.color}, ${nextTier ? nextTier.color : currentTier.color})`,
                        }}
                    />

                    {/* Tier Markers */}
                    <TooltipProvider>
                        <div className="absolute inset-0 pointer-events-none">
                            {tiers.map((tier, index) => (
                                <Tooltip key={tier.name}>
                                    <TooltipTrigger asChild>
                                        <div
                                            className={`absolute top-0 bottom-0 flex items-center justify-center ${index === 0 ? "left-0" : ""} pointer-events-auto`}
                                            style={{
                                                left: `${calculateTierPosition(index)}%`,
                                                transform: index === 0 ? "translateX(0)" : "translateX(-50%)",
                                                zIndex: 10,
                                            }}
                                        >
                                            <div
                                                className={`h-8 w-1 ${currentPoints >= tier.threshold ? "bg-background" : "bg-muted-foreground"}`}
                                            />
                                        </div>
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
                </div>

                {/* Tier Labels */}
                <div className="flex justify-between mt-2">
                    {tiers.map((tier, index) => (
                        <div
                            key={tier.name}
                            className={`flex flex-col items-center ${index === 0 ? "items-start" : index === tiers.length - 1 ? "items-end" : "items-center"
                                }`}
                            style={{
                                width: index === 0 || index === tiers.length - 1 ? "auto" : "1px",
                                flex: index === 0 || index === tiers.length - 1 ? "0 0 auto" : "1",
                            }}
                        >
                            <div
                                className="flex items-center justify-center rounded-full p-1 mb-1"
                                style={{
                                    backgroundColor: currentPoints >= tier.threshold ? `${tier.color}20` : "transparent",
                                }}
                            >
                                <tier.icon
                                    className="h-4 w-4"
                                    style={{
                                        color: currentPoints >= tier.threshold ? tier.color : "var(--muted-foreground)",
                                    }}
                                />
                            </div>
                            <span className={`text-xs ${currentPoints >= tier.threshold ? "font-bold" : "text-muted-foreground"}`}>
                                {tier.name}
                            </span>
                            <span className="text-xs text-muted-foreground">{tier.threshold}</span>
                        </div>
                    ))}
                </div>

                {/* Next Tier Info and Upgrade Button */}
                {nextTier && (
                    <>
                        <div className="mt-6 p-3 bg-muted-foreground rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <nextTier.icon className="h-5 w-5" style={{ color: nextTier.color }} />
                                <span>
                                    Next: <strong>{nextTier.name} Tier</strong>
                                </span>
                            </div>
                            <div className="text-sm">
                                {currentPoints >= nextTier.threshold
                                    ? <span className="font-bold">Ready to upgrade!</span>
                                    : <span><span className="font-bold">{nextTier.threshold - currentPoints}</span> points needed</span>
                                }
                            </div>
                        </div>

                        {currentPoints >= nextTier.threshold && (
                            <button
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
                                        
                                        toastSuccess("Upgrade request created successfully", { description: "An adminstrator will review your request." });                            
                                    } catch (error) {
                                        toastError("Failed to create ticket", { description: error.message });
                                        console.error(error);
                                    }
                                }}
                                className="mt-4 w-full p-3 bg-muted-foreground rounded-lg flex items-center justify-center gap-2 text-sm hover:bg-muted-foreground/90 transition-colors"
                            >
                                <Sparkles className="h-5 w-5" style={{ color: nextTier.color }} />
                                <span>Request Upgrade to <strong>{nextTier.name}</strong></span>
                            </button>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}

export default TierProgressBar
