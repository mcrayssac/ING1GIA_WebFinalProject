"use client"

import { useUser } from "@/contexts/UserContext";
import TierProgressBar from "@/components/tier-progress-bar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProgressPage() {
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push('/');
        } else if (user.admin) {
            router.push('/tickets');
        }
    }, [user, router]);

    if (!user || user.admin) {
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
