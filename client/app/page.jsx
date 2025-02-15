import React from 'react';
import { ChartNoAxesCombined, LibraryBig } from "lucide-react";

import BackgroundVideo from '@/components/backgroundvideo';
import Countdown from '@/components/coutdown';
import StatsPage from '@/components/stats';
import TimelinePage from '@/components/timeline';

import { stats, historyEvents, nextTarget } from '@/data/data';

export default function Home() {
    return (
        <div>
            <div className="relative h-screen overflow-hidden rounded-2xl shadow-xl">
                <BackgroundVideo path="/videos/space_launches_4k.mp4" type="video/mp4" />
                <div className="relative z-10 flex flex-col items-center justify-center h-full bg-black bg-opacity-50">
                    <Countdown targetDate={nextTarget} />
                </div>
            </div>

            <div className={`container mt-8 mx-auto px-4 py-8 text-primary`}>
                <div className="flex items-center space-x-4">
                    <ChartNoAxesCombined className="w-8 h-8" />
                    <h1 className="text-4xl font-black font-mono text-start">Our Stats</h1>
                </div>

                <StatsPage statsData={stats} />
            </div>

            <div className='divider mx-12' />

            <div className={`container mt-8 mx-auto px-4 py-8 text-primary`}>
                <div className="flex items-center space-x-4">
                    <LibraryBig className="w-8 h-8" />
                    <h1 className="text-4xl font-black font-mono text-start">Our Story</h1>
                </div>

                <TimelinePage historyEvents={historyEvents} />
            </div>
        </div>
    );
};
