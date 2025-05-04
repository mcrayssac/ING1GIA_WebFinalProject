"use client"

export const PulseIndicator = ({ color = "bg-green-500", size = "h-3 w-3" }) => {
    return (
        <div className="relative flex">
            <div className={`${size} rounded-full ${color}`}></div>
            <div
                className={`absolute inset-0 ${color} rounded-full animate-ping opacity-75`}
                style={{ animationDuration: "2s" }}
            ></div>
        </div>
    )
}