"use client";

import React, { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { Rocket, Home, Building2, Map, Search, MapPinned, MapPin, FlaskConical } from "lucide-react";

import Alert from "@/components/alert";
import NoData from "@/components/no-data";
import Loading from "@/components/loading";

// Marker icon mapping
const markerMapping = {
    launch: { icon: Rocket, color: "oklch(var(--s))" },
    hq: { icon: Home, color: "oklch(var(--nc))" },
    office: { icon: Building2, color: "green" },
    test: { icon: FlaskConical, color: "purple" },
};

// Custom icon for markers
function createCustomIcon(IconComponent, color) {
    const iconMarkup = renderToStaticMarkup(
        <div style={{ color, fontSize: "24px" }}>
            <IconComponent />
        </div>
    );
    return L.divIcon({
        html: iconMarkup,
        className: "custom-marker",
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30],
    });
}

// Dynamic imports for leaflet components
const MapContainer = dynamic(
    () => import("react-leaflet").then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import("react-leaflet").then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import("react-leaflet").then((mod) => mod.Marker),
    { ssr: false }
);
const Popup = dynamic(
    () => import("react-leaflet").then((mod) => mod.Popup),
    { ssr: false }
);
const Polygon = dynamic(
    () => import("react-leaflet").then((mod) => mod.Polygon),
    { ssr: false }
);

export default function MapPage() {
    const mapRef = useRef(null);
    const [sitesData, setSitesData] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // Fetch sites data
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sites`, {
            method: "GET",
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch sites");
                }
                return res.json();
            })
            .then((data) => {
                setSitesData(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    // Check if sites data is available
    const safeSites = Array.isArray(sitesData) && sitesData.length > 0 ? sitesData : [];

    // Local state for visible site ids and legend search query
    const [visibleSiteIds, setVisibleSiteIds] = useState(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("visibleSiteIds");
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch (err) {
                    console.error("Error parsing visibleSiteIds:", err);
                }
            }
        }
        return [];
    });
    const [legendQuery, setLegendQuery] = useState("");

    // Set visible site ids to all site ids when safeSites change
    useEffect(() => {
        if (safeSites.length > 0 && visibleSiteIds.length === 0) {
            setVisibleSiteIds(safeSites.map((s) => s._id));
        }
    }, [safeSites, visibleSiteIds]);

    // Save visibleSiteIds to localStorage whenever they change.
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("visibleSiteIds", JSON.stringify(visibleSiteIds));
        }
    }, [visibleSiteIds]);

    // Filter sites based on legend search query
    const filteredLegendSites = safeSites.filter(
        (site) =>
            site.name.toLowerCase().includes(legendQuery.toLowerCase()) ||
            site.description.toLowerCase().includes(legendQuery.toLowerCase()) ||
            site.openHours.toLowerCase().includes(legendQuery.toLowerCase())
    );

    // Filter sites based on visible site ids
    const mapSites = filteredLegendSites.filter((site) =>
        visibleSiteIds.includes(site._id)
    );

    // Calculate initial center and bounds
    const allCoords = mapSites.map((site) => site.coordinates);
    const bounds = allCoords.length > 0 ? L.latLngBounds(allCoords) : L.latLngBounds([[40.7128, -74.0060]]);
    const initialCenter = bounds.isValid() ? bounds.getCenter() : [40.7128, -74.0060];

    // Fit map to markers when sites change
    const fitMapToMarkers = () => {
        if (!mapRef.current || mapSites.length === 0) return;
        const map = mapRef.current;
        const bounds = L.latLngBounds(mapSites.map((site) => site.coordinates));
        map.fitBounds(bounds, { padding: [50, 50] });
    };

    // Center map on a given site
    const centerMapOnSite = (site) => {
        if (!mapRef.current) return;
        const map = mapRef.current;
        map.setView(site.coordinates, 15, { animate: true });
    };

    // Handle map ready event
    const handleMapReady = ({ target: map }) => {
        mapRef.current = map;
        fitMapToMarkers();
    };

    // Toggle site visibility
    const toggleSiteVisibility = (_id) => {
        setVisibleSiteIds((prev) =>
            prev.includes(_id) ? prev.filter((siteId) => siteId !== _id) : [...prev, _id]
        );
    };

    return (
        <>
            {loading && <Loading />}
            {error && <Alert type="error" message={error} onClose={() => setError("")} />}
            {!loading && safeSites.length === 0 && <NoData message="No sites data available" />}
            {!loading && safeSites.length > 0 && (
                <>
                    <div className={`container mt-8 mx-auto px-4 py-8`}>

                        <div className="flex items-center space-x-4">
                            <Map className="w-8 h-8" />
                            <h1 className="text-4xl font-black font-mono text-start">Sites Map</h1>
                        </div>
                        <div className="flex items-center justify-center mt-12 join">
                            <label className="input input-bordered input-primary flex items-center gap-2 join-item w-full max-w-xs">
                                <input type="text" className="grow placeholder-oklch-p" placeholder="Discover hidden space stations..." value={legendQuery} onChange={(e) => setLegendQuery(e.target.value)} style={{ color: "oklch(var(--p))" }} />
                                <Search className="w-6 h-6" style={{ color: "oklch(var(--p))" }} />
                            </label>
                            <button className="btn btn-primary join-item" onClick={fitMapToMarkers}>
                                <MapPinned className="w-6 h-6" />
                                Center map
                            </button>
                        </div>
                        <div className="flex h-screen mt-12 space-x-4">
                            <div className="relative rounded-2xl overflow-hidden shadow-xl" style={{ width: "60%", zIndex: 0 }}>
                                <MapContainer
                                    center={[initialCenter.lat, initialCenter.lng]}
                                    zoom={13}
                                    style={{ height: "100%", width: "100%" }}
                                    whenReady={handleMapReady}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    {mapSites.map((site) => {
                                        const mapping = markerMapping[site.markerType] || { icon: Rocket, color: "gray" };
                                        const customIcon = createCustomIcon(mapping.icon, mapping.color);
                                        return (
                                            <React.Fragment key={site._id}>
                                                <Marker position={site.coordinates} icon={customIcon}>
                                                    <Popup>
                                                        <div className="flex items-center gap-2">
                                                            <mapping.icon
                                                                className="w-6 h-6"
                                                                style={{ color: mapping.color }}
                                                            />
                                                            <h2
                                                                className="text-lg font-bold font-mono"
                                                                style={{ color: mapping.color }}
                                                            >
                                                                {site.name}
                                                            </h2>
                                                        </div>
                                                        <p>{site.description}</p>
                                                        <p className="text-sm text-gray-600">
                                                            Open Hours: {site.openHours}
                                                        </p>
                                                    </Popup>
                                                </Marker>
                                                {site.geometry && (
                                                    <Polygon
                                                        positions={site.geometry}
                                                        pathOptions={{
                                                            color: mapping.color,
                                                            weight: 2,
                                                            fillOpacity: 0.2,
                                                        }}
                                                    />
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </MapContainer>
                            </div>

                            <div
                                className="flex flex-col p-4 overflow-y-auto space-y-4 rounded-2xl shadow-xl"
                                style={{ width: "40%", height: "100%" }}
                            >
                                <div className="mb-4">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-6 h-6" />
                                        <h3 className="text-xl font-bold font-mono">Legend</h3>
                                    </div>
                                </div>

                                {filteredLegendSites.map((site) => {
                                    const mapping = markerMapping[site.markerType] || { icon: Rocket, color: "gray" };
                                    const IconComponent = mapping.icon;
                                    return (
                                        <div className="card bg-primary shadow-xl" key={site._id}>
                                            <div className="card-body">
                                                <div className="card-title flex">
                                                    <div className="tooltip tooltip-secondary tooltip-bottom" data-tip={site.name}>
                                                        <div className="flex items-center gap-2">
                                                            <IconComponent className="w-6 h-6 align-middle" style={{ color: mapping.color }} />
                                                            <h2 className="text-lg font-bold font-mono text-accent-foreground line-clamp-1 text-left leading-none">{site.name}</h2>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-center join ml-auto tooltip tooltip-secondary tooltip-left" data-tip="Toggle visibility or center map">
                                                        <input type="checkbox" checked={visibleSiteIds.includes(site._id)}
                                                            onChange={(e) => {
                                                                e.stopPropagation();
                                                                toggleSiteVisibility(site._id);
                                                            }}
                                                            className="checkbox checkbox-secondary checkbox-lg join-item"
                                                        />
                                                        <button className="btn btn-secondary btn-sm join-item" onClick={() => centerMapOnSite(site)}><MapPinned /></button>
                                                    </div>
                                                </div>
                                                <div className="tooltip tooltip-secondary tooltip-bottom" data-tip={site.description}>
                                                    <p className="text-sm text-primary-content line-clamp-2">{site.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {filteredLegendSites.length === 0 && (<NoData message="No search results found" />)}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
