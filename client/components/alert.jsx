"use client";

import React, { useEffect, useState } from "react";
import { CircleX, CircleCheck, Info, TriangleAlert } from "lucide-react";

export default function Alert({ type = "error", message, autoClose = 5000, onClose, className }) {
    const initialCountdown = autoClose / 1000;
    const [countdown, setCountdown] = useState(initialCountdown);

    // Update the countdown every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Close the alert after the specified time
        const timeout = setTimeout(() => {
            if (onClose) onClose();
        }, autoClose);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [autoClose, onClose]);

    // Determine the alert class, progress class, and icon based on the type
    let alertClass = "alert ";
    let alertProgress = "progress ";
    let alertIcon = null;
    switch (type) {
        case "success":
            alertClass += "alert-success";
            alertProgress += "progress-success";
            alertIcon = <CircleCheck size="1em" />;
            break;
        case "warning":
            alertClass += "alert-warning";
            alertProgress += "progress-warning";
            alertIcon = <TriangleAlert size="1em" />;
            break;
        case "info":
            alertClass += "alert-info";
            alertProgress += "progress-info";
            alertIcon = <Info size="1em" />;
            break;
        default:
            alertClass += "alert-error";
            alertProgress += "progress-error";
            alertIcon = <CircleX size="1em" />;
    }

    // Compute progress percentage (0 to 100)
    const progressValue = (countdown / initialCountdown) * 100;

    return (
        <div role="alert" className={alertClass + " " + className}>
            <span className="mr-2">{alertIcon}</span>
            <span>{message}</span>
            <div className="radial-progress text-primary ml-auto" style={{ "--value": progressValue, "--size": "2em" }} role="progressbar" />
        </div>
    );
}
