"use client"

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TierProgressBar from "@/components/tier-progress-bar";

export default function TierProgressExample() {
    const [points, setPoints] = useState(250)

    const addPoints = (amount) => {
        setPoints((prev) => Math.max(0, prev + amount))
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto space-y-8">
                <TierProgressBar currentPoints={points} />

                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                            <div className="flex items-center gap-2">
                                <Button variant="secondary" size="icon" onClick={() => addPoints(-10)}>
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-16 text-center font-bold">{points}</span>
                                <Button variant="secondary" size="icon" onClick={() => addPoints(10)}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={() => setPoints(0)}>
                                    Reset
                                </Button>
                                <Button variant="secondary" onClick={() => setPoints(50)}>
                                    Bronze
                                </Button>
                                <Button variant="secondary" onClick={() => setPoints(150)}>
                                    Silver
                                </Button>
                                <Button variant="secondary" onClick={() => setPoints(400)}>
                                    Gold
                                </Button>
                                <Button variant="secondary" onClick={() => setPoints(700)}>
                                    Platinum
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

