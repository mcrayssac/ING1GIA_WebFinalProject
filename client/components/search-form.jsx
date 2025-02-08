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
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <SidebarInput id="search" placeholder="Type to search..." className="h-8 pl-7" value={query} onChange={(e) => setQuery(e.target.value)}/>
        <Search
          className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
      </div>
    </form>)
  );
}
