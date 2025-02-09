"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { Search } from "lucide-react"
import { Label } from "@/components/ui/label"
import { SidebarInput } from "@/components/ui/sidebar"

export function SearchForm({
  ...props
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Redirect to the /search page with the query parameter
    if (query.trim() !== "") router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    (<form onSubmit={handleSubmit} {...props}>
      <div className="relative">
        <label className="input input-bordered input-sm input-primary flex items-center gap-2 join-item w-full max-w-xs">
            <input type="text" className="grow placeholder-oklch-p" placeholder="Search the cosmos..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ color: "oklch(var(--p))" }} />
            <Search className="w-4 h-4" style={{ color: "oklch(var(--p))" }} />
        </label>
      </div>
    </form>)
  );
}
