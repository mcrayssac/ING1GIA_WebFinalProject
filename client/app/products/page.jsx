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
      "/pictures/falcon9.jpg",
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
      "/pictures/starship.jpg",
    categories: ["Vehicles", "Spaceship"],
    badges: ["Next-gen"],
    isNew: true,
  },
  {
    id: 3,
    title: "Raptor engine",
    description:
      "The Raptor engine is a full-flow staged combustion rocket engine developed by SpaceX for its Starship vehicle.",
    image:
      "/pictures/raptor_engine.jpg",
    categories: ["Technologies", "Engine"],
    badges: ["High Performance"],
    isNew: false,
  },
  {
    id: 4,
    title: "Dragon capsule",
    description:
      "The Dragon capsule is a spacecraft developed by SpaceX for transporting crew and cargo to the International Space Station.",
    image:
      "/pictures/dragon_capsule.jpg",
    categories: ["Vehicles", "Spaceship"],
    badges: ["Crewed"],
    isNew: false,
  },
  {
    id: 5,
    title: "Heat shield technology",
    description:
      "Advanced heat shield materials and design ensure safe re-entry of SpaceX vehicles into Earth's atmosphere.",
    image:
      "/pictures/heat_shield_technology.jpg",
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
                        <img className="w-full h-96 object-cover" src={item.image} alt={item.title} />
                    </figure>
                    <div className="card-body">
                        <h2 className="card-title text-accent-foreground">
                        {item.title}
                        {item.isNew && (
                            <div className="badge badge-secondary ml-2">NEW</div>
                        )}
                        </h2>
                        <p>{item.description}</p>
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
            ) : (
                <div className={`skeleton w-full h-96`}>
                    <div className="flex items-center justify-center h-full">
                    <h1 className="text-2xl font-black font-mono">No results found</h1>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}
