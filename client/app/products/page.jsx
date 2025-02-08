"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Box, Search } from "lucide-react";

// Sample static data
const staticData = [
  {
    id: 1,
    title: "Falcon 9",
    description:
      "The Falcon 9 is a two-stage rocket designed and manufactured by SpaceX for reliable transport of satellites and Dragon spacecraft into orbit.",
    image:
      "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp", // placeholder image
    categories: ["Vehicles", "Rocket"],
    badges: ["Reusable", "Heavy-lift"],
    isNew: true,
  },
  {
    id: 2,
    title: "Starship",
    description:
      "Starship is SpaceX's fully reusable transportation system designed to carry crew and cargo to Earth orbit, the Moon, Mars, and beyond.",
    image:
      "https://img.daisyui.com/images/stock/photo-1567306226416-28f0efdc88ce.webp", // placeholder image
    categories: ["Vehicles", "Spaceship"],
    badges: ["Next-gen"],
    isNew: true,
  },
  {
    id: 3,
    title: "Raptor Engine",
    description:
      "The Raptor engine is a full-flow staged combustion rocket engine developed by SpaceX for its Starship vehicle.",
    image:
      "https://img.daisyui.com/images/stock/photo-1556740749-887f6717d7e4.webp", // placeholder image
    categories: ["Technologies", "Engine"],
    badges: ["High Performance"],
    isNew: false,
  },
  {
    id: 4,
    title: "Dragon Capsule",
    description:
      "The Dragon capsule is a spacecraft developed by SpaceX for transporting crew and cargo to the International Space Station.",
    image:
      "https://img.daisyui.com/images/stock/photo-1551214012-84f95e060dee.webp", // placeholder image
    categories: ["Vehicles", "Spaceship"],
    badges: ["Crewed"],
    isNew: false,
  },
  {
    id: 5,
    title: "Heat Shield Technology",
    description:
      "Advanced heat shield materials and design ensure safe re-entry of SpaceX vehicles into Earth's atmosphere.",
    image:
      "https://img.daisyui.com/images/stock/photo-1564869731257-0c108a6b9e3a.webp", // placeholder image
    categories: ["Technologies"],
    badges: ["Innovative"],
    isNew: false,
  },
];

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
        ...new Set(staticData.flatMap((item) => item.categories)),
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
    const filteredData = staticData.filter((item) => {
        const matchesQuery =
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase());
        const matchesCategory =
        selectedCategories.length === 0 ||
        item.categories.some((cat) => selectedCategories.includes(cat));
        return matchesQuery && matchesCategory;
    });

    const textColor = "text-slate-500";
    const textHighlight = "text-sky-800";
    const bgColor = "bg-blue-50";

  return (
    <div className={`container mt-8 mx-auto px-4 py-8 ${textColor}`}>
        <div className="flex items-center space-x-4">
          <Box className="w-8 h-8" /> 
          <h1 className="text-4xl font-black font-mono text-start">Products</h1>
        </div>
        <div className="flex items-center justify-center mt-12 join">
            <div>
                <label className="input input-bordered join-item flex items-center gap-2">
                    <input type="text" className="grow" placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
                    <Search className="w-6 h-6" />
                </label>
            </div>
            <div className="dropdown dropdown-hover">
                <div tabIndex={0} role="button" className="btn join-item">Categories</div>
                <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                    {allCategories.map((category) => (
                    <li key={category}>
                        <label className="cursor-pointer">
                        <input
                            type="checkbox"
                            checked={selectedCategories.includes(category)}
                            onChange={() => toggleCategory(category)}
                            className="checkbox"
                        />
                        <span className="ml-2">{category}</span>
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
                    <div key={item.id} className="card bg-base-100 w-96 shadow-xl">
                    <figure>
                        <img src={item.image} alt={item.title} />
                    </figure>
                    <div className="card-body">
                        <h2 className="card-title">
                        {item.title}
                        {item.isNew && (
                            <div className="badge badge-secondary ml-2">NEW</div>
                        )}
                        </h2>
                        <p>{item.description}</p>
                        <div className="card-actions justify-end">
                        {item.badges.map((badge, index) => (
                            <div key={index} className="badge badge-outline">
                            {badge}
                            </div>
                        ))}
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            ) : (
                <div className={`skeleton w-full h-96 ${bgColor}`}>
                    <div className="flex items-center justify-center h-full">
                    <p>No results found.</p>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}
