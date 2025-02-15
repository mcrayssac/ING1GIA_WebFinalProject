"use client";

import React from "react";
import * as Icons from "lucide-react";

function TimelineItem({ event, align }) {
    const IconComponent = Icons[event.icon] || Icons.CircleCheckBig;

    return (
        <li>
            <div className="timeline-middle text-secondary">
                <IconComponent className="w-8 h-8 p-1" />
            </div>
            <div className={`timeline-${align} mb-10 md:text-${align === "start" ? "end" : "start"}`}>
                <time className="font-mono italic text-muted-foreground">{event.date}</time>
                <div className="text-lg font-black font-mono text-secondary">{event.title}</div>
                <p>{event.description}</p>
            </div>
            <hr />
        </li>
    );
}

export default function TimelinePage({ historyEvents }) {
    return (
        <ul className="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical">
            {historyEvents.map((event, index) => (
                <TimelineItem key={event.id} event={event} align={index % 2 === 0 ? "start" : "end"} />
            ))}
        </ul>
    );
}