"use client";

import { useEffect, useState } from "react";
import { ChartNoAxesCombined, LibraryBig } from "lucide-react";

import BackgroundVideo from '@/components/backgroundvideo';
import Countdown from '@/components/coutdown';
import StatsPage from '@/components/stats';
import TimelinePage from '@/components/timeline';

import { nextTarget } from '@/data/data';

import Alert from "@/components/alert";
import NoData from "@/components/no-data";
import Loading from "@/components/loading";

export default function Home() {
    const [error, setError] = useState("");
    const [statistics, setStatistics] = useState([]);
    const [statsLoading, setStatsLoading] = useState(true);
    const [timelineEvents, setTimelineEvents] = useState([]);
    const [timelineLoading, setTimelineLoading] = useState(true);

    // Fetch statistics data from API
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/statistics`, {
            method: "GET",
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch statistics");
                }
                return res.json();
            })
            .then((data) => {
                setStatistics(data);
                setStatsLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setStatsLoading(false);
            });
    }, []);

    // Fetch timeline (history events) from API
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/history-events`, {
            method: "GET",
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch history events");
                }
                return res.json();
            })
            .then((data) => {
                setTimelineEvents(data);
                setTimelineLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setTimelineLoading(false);
            });
    }, []);

    return (
        <div>
            {error && <Alert type="error" message={error} onClose={() => setError("")} className="mb-4" />}
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

                {statsLoading ? (
                    <Loading className="m-8" />
                ) : statistics.length === 0 ? (
                    <NoData message="No statistics available" className="m-8" />
                ) : (
                    <StatsPage statsData={statistics} />
                )}
            </div>

            <div className='divider mx-12' />

            <div className={`container mt-8 mx-auto px-4 py-8 text-primary`}>
                <div className="flex items-center space-x-4">
                    <LibraryBig className="w-8 h-8" />
                    <h1 className="text-4xl font-black font-mono text-start">Our Story</h1>
                </div>

                {timelineLoading ? (
                    <Loading className="m-8" />
                ) : timelineEvents.length === 0 ? (
                    <NoData message="No history events available" className="m-8" />
                ) : (
                    <TimelinePage historyEvents={timelineEvents} />
                )}
            </div>
        </div>
    );
};
