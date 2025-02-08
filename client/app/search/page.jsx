"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { TextSearch } from "lucide-react";

export default function SearchPage() {
  // Get the URL search parameters.
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  // Dummy data to simulate search results.
  const dummyData = [
    {
      id: 1,
      title: "Space Y Rocket Launch",
      description:
        "Learn about the latest rocket launch by Space Y and its groundbreaking technology.",
      route: "/rocket-launch",
    },
    {
      id: 2,
      title: "Innovations in Propulsion Systems",
      description:
        "Discover how Space Y is pushing the boundaries of propulsion technology.",
      route: "/propulsion-systems",
    },
    {
      id: 3,
      title: "Interplanetary Travel Insights",
      description:
        "Explore Space Y's plans for making interplanetary travel accessible.",
      route: "/interplanetary-travel",
    },
    {
      id: 4,
      title: "About Us",
      description: "Learn more about Space Y's mission and vision.",
      route: "/about",
    },
    {
      id: 5,
      title: "Contact",
      description: "Get in touch with the Space Y team.",
      route: "/contact",
    },
  ];

  // Filter dummy data based on the query (case-insensitive).
  const filteredResults = query
    ? dummyData.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
      )
    : dummyData;

    const textColor = "text-slate-500";
    const textHighlight = "text-sky-800";
    const bgColor = "bg-blue-50";

  return (
    <div className={`container mt-8 mx-auto px-4 py-8 ${textColor}`}>
        <div className="flex items-center space-x-4">
          <TextSearch className="w-8 h-8" /> 
          <h1 className="text-4xl font-black font-mono text-start">Search results {query && `for "${query}"`}</h1>
        </div>
        <div className="flex items-center justify-center mt-12">
            {filteredResults.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                    {filteredResults.map((item) => (
                    <div key={item.id} className={`card bg-base-100 w-96 shadow-xl ${bgColor}`}>
                        <div className="card-body">
                            <h2 className={`card-title ${textHighlight}`}>{item.title}</h2>
                            <p>{item.description}</p>
                            <div className="card-actions justify-end">
                                <Link href={item.route} className={`btn ${bgColor} ${textColor}`}>
                                Read More
                                </Link>
                            </div>
                        </div>
                    </div>
                    ))}
                </div>
            ) : (
                <p>No results found.</p>
            )}
        </div>
    </div>
  );
}
