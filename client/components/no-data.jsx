export default function NoData( { message } ) {
    return (
        <div className={`skeleton w-full h-96`}>
            <div className="flex items-center justify-center h-full">
                <h1 className="text-2xl font-black font-mono">{message}</h1>
            </div>
        </div>
    );
}