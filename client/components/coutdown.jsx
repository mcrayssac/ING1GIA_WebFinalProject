"use client";

import React, { useEffect, useState } from 'react';
import { Rocket } from 'lucide-react';

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
        <div className={`flex flex-col items-center space-y-4 ${textColor}`}>
            <h1 className="text-6xl font-mono leading-none animate-bounce" style={{ animationDuration: "5s" }}>
                Our next adventure begins in
            </h1>

            <div className="grid grid-flow-col gap-5 text-centerfont-mono auto-cols-max">
                <div className="flex flex-col items-center">
                    <span className="countdown text-8xl font-mono transition-transform transform hover:scale-125">
                        <span style={{ "--value": timeLeft.days }}></span>
                    </span>
                    days
                </div>
                <div className="flex flex-col items-center">
                    <span className="countdown text-8xl font-mono transition-transform transform hover:scale-125">
                        <span style={{ "--value": timeLeft.hours }}></span>
                    </span>
                    hours
                </div>
                <div className="flex flex-col items-center">
                    <span className="countdown text-8xl font-mono transition-transform transform hover:scale-125">
                        <span style={{ "--value": timeLeft.minutes }}></span>
                    </span>
                    min
                </div>
                <div className="flex flex-col items-center">
                    <span className="countdown text-8xl font-mono transition-transform transform hover:scale-125">
                        <span style={{ "--value": timeLeft.seconds }}></span>
                    </span>
                    sec
                </div>
            </div>

            <div className="flex items-center space-x-2 link link-hover hover:no-underline transition-transform transform hover:scale-125">
                <Rocket className="w-5 h-5 animate-spin" style={{ animationDuration: "10s" }} />
                <span className="text-lg font-mono">Blast off!</span>
            </div>
        </div>
    );
};
