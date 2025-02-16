"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Box, Search } from "lucide-react";

import NoData from "@/components/no-data";

import { products } from "@/data/data";

export default function Products() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Read initial values from URL parameters
    const initialQuery = searchParams.get("q") || "";
    const initialCategories = searchParams.get("categories")
        ? searchParams.get("categories").split(",")
        : [];

    // Initialize state with initial values
    const [query, setQuery] = useState(initialQuery);
    const [selectedCategories, setSelectedCategories] = useState(initialCategories);

    // When the query or filters change, update the URL parameters.
    useEffect(() => {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (selectedCategories.length > 0) {
            params.set("categories", selectedCategories.join(","));
        }
        router.replace(`/products?${params.toString()}`);
    }, [query, selectedCategories, router]);

    // If the URL parameters change externally, update the state
    useEffect(() => {
        const newQuery = searchParams.get("q") || "";
        const newCategories = searchParams.get("categories")
            ? searchParams.get("categories").split(",")
            : [];
        setQuery(newQuery);
        setSelectedCategories(newCategories);
    }, [searchParams]);

    // Get all unique categories from data
    const allCategories = [
        ...new Set(products.flatMap((item) => item.categories)),
    ];

    // Toggle a category in the filter selection
    const toggleCategory = (category) => {
        setSelectedCategories((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category]
        );
    };

    // Filter data based on query and selected categories
    const filteredData = products.filter((item) => {
        const matchesQuery =
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase());
        const matchesCategory =
            selectedCategories.length === 0 ||
            item.categories.some((cat) => selectedCategories.includes(cat));
        return matchesQuery && matchesCategory;
    });

    return (
        <div className={`container mt-8 mx-auto px-4 py-8`}>
            <div className="flex items-center space-x-4">
                <Box className="w-8 h-8" />
                <h1 className="text-4xl font-black font-mono text-start">Products</h1>
            </div>
            <div className="flex items-center justify-center mt-12 join">
                <label className="input input-bordered input-primary flex items-center gap-2 join-item w-full max-w-xs">
                    <input type="text" className="grow placeholder-oklch-p" placeholder="Beam up your favorite gadget..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ color: "oklch(var(--p))" }} />
                    <Search className="w-6 h-6" style={{ color: "oklch(var(--p))" }} />
                </label>
                <div className="dropdown dropdown-hover">
                    <div tabIndex={0} role="button" className="btn btn-primary join-item">Categories</div>
                    <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                        {allCategories.map((category) => (
                            <li key={category}>
                                <label className="label cursor-pointer">
                                    <span className="label-text" style={{ color: "oklch(var(--p))" }}>{category}</span>
                                    <input type="checkbox" checked={selectedCategories.includes(category)} onChange={() => toggleCategory(category)} className="checkbox checkbox-primary" />
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="flex items-center justify-center mt-12">
                {/* Cards Grid */}
                {filteredData.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredData.map((item) => (
                            <div key={item.id} className="card shadow-xl bg-primary text-primary-content">
                                <figure>
                                    {item.image && (
                                        <img className="w-full h-96 object-cover" src={item.image} alt={item.title} />
                                    )}
                                    {!item.image && (
                                        <img className="w-full h-96 object-cover" src="/pictures/spacey_logo.png" alt={item.title} />
                                    )}
                                </figure>
                                <div className="card-body">
                                    <h2 className="card-title text-accent-foreground">
                                        {item.title}
                                        {item.isNew && (
                                            <div className="badge badge-secondary ml-2">NEW</div>
                                        )}
                                    </h2>
                                    <div className="tooltip tooltip-bottom tooltip-secondary text-start" data-tip={item.description}>
                                        <p className="line-clamp-3">{item.description}</p>
                                    </div>
                                    <div className="card-actions justify-end">
                                        {item.badges.map((badge, index) => (
                                            <div key={index} className="badge badge-outline text-accent-foreground">
                                                {badge}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (<NoData message={"No products found. Try a different search."} />)
                }
            </div>
        </div>
    );
}
