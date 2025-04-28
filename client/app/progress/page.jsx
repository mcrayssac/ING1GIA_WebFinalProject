"use client"

import { useUser } from "@/contexts/UserContext";
import TierProgressBar from "@/components/tier-progress-bar";

export default function ProgressPage() {
    const { user } = useUser();

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto text-center">
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto space-y-8">
                <TierProgressBar 
                    currentPoints={user.points} 
                    currentGrade={user.grade}
                />
            </div>
        </div>
    );
}
