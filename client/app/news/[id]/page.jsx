"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Newspaper, Search } from "lucide-react";

import NoData from "@/components/no-data";
import Alert from "@/components/alert";
import Loading from "@/components/loading";

export default function NewsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [newsData, setNewsData] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/news`, {
            method: "GET",
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch news");
                }
                return res.json();
            })
            .then((data) => {
                setNewsData(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const initialQuery = searchParams.get("q") || "";
    const initialCategory = searchParams.get("category") || "";
    const initialLocation = searchParams.get("location") || "";

    const [query, setQuery] = useState(initialQuery);
    const [category, setCategory] = useState(initialCategory);
    const [location, setLocation] = useState(initialLocation);

    useEffect(() => {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (category) params.set("category", category);
        if (location) params.set("location", location);
        router.replace(`/news?${params.toString()}`);
    }, [query, category, location, router]);

    useEffect(() => {
        setQuery(searchParams.get("q") || "");
        setCategory(searchParams.get("category") || "");
        setLocation(searchParams.get("location") || "");
    }, [searchParams]);

    const categories = [...new Set(newsData.map((n) => n.category).filter(Boolean))];
    const locations = [...new Set(newsData.map((n) => n.location).filter(Boolean))];

    const filteredNews = newsData.filter((item) => {
        const matchQuery =
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.content.toLowerCase().includes(query.toLowerCase());
        const matchCategory = !category || item.category === category;
        const matchLocation = !location || item.location === location;
        return matchQuery && matchCategory && matchLocation;
    });

    return (
        <>
            {error && <Alert type="error" message={error} onClose={() => setError("")} />}
            <div className="container mt-8 mx-auto px-4 py-8">
                <div className="flex items-center space-x-4">
                    <Newspaper className="w-8 h-8" />
                    <h1 className="text-4xl font-black font-mono text-start">Latest News</h1>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row md:items-end items-center gap-4 mt-8">
                    <label className="form-control w-full md:w-1/3">
                        <div className="label">
                            <span className="label-text">Category</span>
                        </div>
                        <select
                            className="select select-bordered"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">All</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </label>

                    <label className="form-control w-full md:w-1/3">
                        <div className="label">
                            <span className="label-text">Location</span>
                        </div>
                        <select
                            className="select select-bordered"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        >
                            <option value="">All</option>
                            {locations.map((loc) => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </label>

                    <label className="form-control w-full md:w-1/3">
                        <div className="label">
                            <span className="label-text">Search</span>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                className="input input-bordered w-full pr-10"
                                placeholder="Search news articles..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                        </div>
                    </label>
                </div>
                <div className="flex items-center justify-center mt-12">
                    {loading && <Loading />}
                    {newsData.length === 0 && !loading && <NoData message="No news available at the moment." />}
                    {!loading && newsData.length > 0 && (
                        <>
                            {filteredNews.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {filteredNews.map((item) => (
                                        <div
                                            key={item._id}
                                            className="card shadow-xl bg-base-100 text-base-content cursor-pointer"
                                            onClick={() => router.push(`/news/${item._id}`)}
                                        >

                                                <figure className="aspect-[3/2] w-full">
                                                <img
                                                    className="w-full h-full object-cover object-center rounded-t"
                                                    src={item.imageUrl || "/pictures/news_placeholder.jpg"}
                                                    alt={item.title}
                                                />
                                                </figure>

                                            {/* <figure>
                                                <img
                                                    className="w-full h-[460px] object-cover object-center rounded-t"
                                                    src={item.imageUrl || "/pictures/news_placeholder.jpg"}
                                                    alt={item.title}
                                                    style={{ maxHeight: "460px", maxWidth: "960px" }}
                                                />
                                            </figure> */}
                                            <div className="card-body">
                                                <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                                                    <span>📍 {item.location}</span>
                                                    <span>📁 {item.category}</span>
                                                </div>
                                                <h2 className="card-title text-accent-foreground">
                                                    {item.title}
                                                </h2>
                                                <p className="line-clamp-4 text-sm text-muted-foreground">
                                                    {item.content}
                                                </p>
                                                <p className="text-xs text-right text-gray-400 mt-2">
                                                    {new Date(item.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <NoData message="No news found. Try another search." />
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
