export default function Loading({ className }) {
    return (
        <div className={`skeleton w-full h-96 ${className}`}>
            <div className="flex flex-col items-center justify-center h-full">
                <span className="loading loading-infinity loading-lg"></span>
                <h1 className="mt-4 text-2xl font-black font-mono">
                    Syncing with interstellar networks...
                </h1>
            </div>
        </div>
    );
}
