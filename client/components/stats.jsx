"use client";

import React from "react";
import * as Icons from "lucide-react";

function StatItem({ icon, title, value, iconValue, desc }) {
    const Icon = Icons[icon] || Icons.Atom;
    const IconValue = Icons[iconValue] || Icons.Atom;

    return (
        <div className="stat">
            <div className="stat-figure text-accent-foreground">
                <Icon className="w-8 h-8" />
            </div>
            <div className="stat-title text-primary-content">{title}</div>
            <div className="stat-value text-accent-foreground">{value}</div>
            <div className="stat-desc text-primary-content">
                <div className="flex items-center space-x-2">
                    <IconValue className="w-4 h-4" />
                    <span>{desc}</span>
                </div>
            </div>
        </div>
    );
}

export default function StatsPage({ statsData }) {
    return (
        <div className="flex items-center justify-center">
            <div className="stats stats-vertical lg:stats-horizontal shadow-xl m-8 mx-auto bg-primary">
                {statsData.map((stat) => (
                    <StatItem key={stat.id} {...stat} />
                ))}
            </div>
        </div>
    );
}
