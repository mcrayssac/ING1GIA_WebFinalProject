import React, { useState, useEffect } from "react";
import { Trophy, Star, Award, Crown, Sparkles } from "lucide-react"
import { DropdownMenuGroup, DropdownMenuItem } from "@/components/ui/dropdown-menu"

const MiniTierProgress = ({ currentPoints = 0, currentGrade = null }) => {
    const [tiers, setTiers] = useState([]);
    const iconMapping = {
        Trophy: Trophy,
        Star: Star,
        Award: Award,
        Crown: Crown,
    };

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/grades`, {
                    method: "GET",
                    credentials: "include",
                });
                if (!res.ok) throw new Error("Failed to fetch grades");
                const data = await res.json();
                const fetchedTiers = data.map((grade) => ({
                    name: grade.name,
                    threshold: grade.cap,
                    icon: iconMapping[grade.icon] || Trophy,
                    color: grade.color,
                }));
                setTiers(fetchedTiers);
            } catch (error) {
                console.error("Error fetching grades:", error);
            }
        };
        fetchGrades();
    }, []);

    if (tiers.length === 0) {
        return <div>No tier data available</div>;
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
    } : tiers[0]
    const nextTier = findNextTier()

    // Calculate progress percentage
    const calculateProgress = () => {
        if (!nextTier) return 100 // Already at max tier

        const currentTierPoints = currentTier.threshold
        const nextTierPoints = nextTier.threshold
        const pointsInCurrentTier = currentPoints - currentTierPoints
        const pointsNeededForNextTier = nextTierPoints - currentTierPoints

        return Math.min(100, Math.round((pointsInCurrentTier / pointsNeededForNextTier) * 100))
    }

    // Calculate the width of the filled progress bar
    const calculateProgressWidth = () => {
        if (!nextTier) return 100

        const currentTierPoints = currentTier.threshold
        const nextTierPoints = nextTier.threshold
        const pointsInCurrentTier = currentPoints - currentTierPoints
        const pointsNeededForNextTier = nextTierPoints - currentTierPoints

        return Math.min(100, (pointsInCurrentTier / pointsNeededForNextTier) * 100)
    }

    const progressWidth = calculateProgressWidth()

    return (
        <>
            <div className="px-2 py-1.5">
                <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                        <div className="p-1 rounded-full" style={{ backgroundColor: `${currentTier.color}20` }}>
                            <currentTier.icon className="h-3.5 w-3.5" style={{ color: currentTier.color }} />
                        </div>
                        <span className="text-xs font-medium">{currentTier.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{currentPoints} pts</div>
                </div>

                <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                        className="absolute h-full transition-all duration-300 ease-in-out rounded-full"
                        style={{
                            width: `${progressWidth}%`,
                            background: `linear-gradient(to right, ${currentTier.color}, ${nextTier ? nextTier.color : currentTier.color})`,
                        }}
                    />
                </div>

                {nextTier ? (
                    <div className="flex justify-between items-center mt-1 text-[10px] text-muted-foreground">
                        <span>
                            {progressWidth.toFixed(0)}% to {nextTier.name}
                        </span>
                        <span>
                            {currentPoints >= nextTier.threshold
                                ? "Ready to upgrade!"
                                : `${nextTier.threshold - currentPoints} pts needed`}
                        </span>
                    </div>
                ) : (
                    <div className="flex justify-between items-center mt-1 text-[10px] text-muted-foreground">
                        <span>Maximum grade achieved!</span>
                        <span>{currentPoints} pts accomplished</span>
                    </div>
                )}
            </div>

            {nextTier && currentPoints >= nextTier.threshold && (
                <button
                onClick={() => window.alert("Upgrade to " + nextTier.name + " triggered")}
                type="button"
                className="relative flex select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors 
  focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 
  [&>svg]:shrink-0 hover:bg-accent hover:text-accent-foreground"
            >
                <Sparkles />
                Upgrade to {nextTier.name}
            </button>
            )}
        </>
    )
}

export default MiniTierProgress;