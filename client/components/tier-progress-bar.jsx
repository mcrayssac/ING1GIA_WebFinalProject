"use client"
import { Trophy, Star, Award, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import React from "react";

const TierProgressBar = ({
    currentPoints = 0,
    tiers = [
        { name: "Bronze", threshold: 0, icon: Trophy, color: "#CD7F32" },
        { name: "Silver", threshold: 100, icon: Star, color: "#C0C0C0" },
        { name: "Gold", threshold: 300, icon: Award, color: "#FFD700" },
        { name: "Platinum", threshold: 600, icon: Crown, color: "#E5E4E2" },
    ],
}) => {
    // Find the current tier and next tier
    const currentTierIndex = tiers.reduce((highestIndex, tier, index) => {
        return currentPoints >= tier.threshold ? index : highestIndex
    }, 0)

    const currentTier = tiers[currentTierIndex]
    const nextTier = tiers[currentTierIndex + 1]

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

    // Calculate the width of the filled progress bar
    const calculateProgressWidth = () => {
        const maxPoints = tiers[tiers.length - 1].threshold
        return Math.min(100, (currentPoints / maxPoints) * 100)
    }

    // Force the progress width to be recalculated when points change
    const progressWidth = React.useMemo(() => calculateProgressWidth(), [currentPoints, tiers])

    return (
        <Card className="w-full shadow-lg">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-xl">Your Progress</CardTitle>
                        <CardDescription>
                            {nextTier
                                ? `${nextTier.threshold - currentPoints} points until ${nextTier.name} tier`
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

                {/* Next Tier Info */}
                {nextTier && (
                    <div className="mt-6 p-3 bg-muted-foreground rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <nextTier.icon className="h-5 w-5" style={{ color: nextTier.color }} />
                            <span>
                                Next: <strong>{nextTier.name} Tier</strong>
                            </span>
                        </div>
                        <div className="text-sm">
                            <span className="font-bold">{nextTier.threshold - currentPoints}</span> points needed
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default TierProgressBar

