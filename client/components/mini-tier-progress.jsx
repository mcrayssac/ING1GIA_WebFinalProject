import { Trophy, Star, Award, Crown } from "lucide-react"

const MiniTierProgress = ({
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

            {nextTier && (
                <div className="flex justify-between items-center mt-1 text-[10px] text-muted-foreground">
                    <span>
                        {progressWidth.toFixed(0)}% to {nextTier.name}
                    </span>
                    <span>{nextTier.threshold - currentPoints} pts needed</span>
                </div>
            )}
        </div>
    )
}

export default MiniTierProgress

