"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Loading from "@/components/loading";
import Alert from "@/components/alert";
import NoData from "@/components/no-data";

/* ------------------------------------------------------------------ */
/* Utils                                                              */
const colorByStatus = (s) =>
  ({ available: ["bg-green-100", "text-green-800"],
     "in-use":  ["bg-yellow-100","text-yellow-800"],
     blocked:   ["bg-red-100",   "text-red-800"],
  }[s] || ["bg-gray-100","text-gray-800"]);

/* petit debounce (300 ms) */
const useDebounced = (value, delay = 300) => {
  const [deb, setDeb] = useState(value);
  useEffect(() => { const t = setTimeout(() => setDeb(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return deb;
};
/* ------------------------------------------------------------------ */

export default function MachinesPage() {
  const router = useRouter();

  /* Filtres & recherche -------------------------- */
  const [search, setSearch]             = useState("");
  const debouncedSearch                 = useDebounced(search);
  const [statusFilter, setStatusFilter] = useState("all");
  const [gradeFilter,  setGradeFilter]  = useState("all");

  /* Données & états UI --------------------------- */
  const [machines, setMachines] = useState([]);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(true);

  /* Fetch machines (selon filtres) --------------- */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); setError("");
      const params = new URLSearchParams();
      if (statusFilter   !== "all") params.append("status",        statusFilter);
      if (gradeFilter    !== "all") params.append("requiredGrade", gradeFilter);
      if (debouncedSearch)          params.append("search",        debouncedSearch);

      try {
        const [mRes, sRes, siteRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machines?${params}`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sensors`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sites`),
        ]);
        if (!mRes.ok)   throw new Error("Failed to fetch machines");
        if (!sRes.ok)   throw new Error("Failed to fetch sensors");
        if (!siteRes.ok)throw new Error("Failed to fetch sites");

        const [mData, sData, siteData] = await Promise.all([mRes.json(), sRes.json(), siteRes.json()]);

        const sensorsById = Object.fromEntries(sData.map((s)=>[s._id,s]));
        const sitesById   = Object.fromEntries(siteData.map((s)=>[s._id,s.name]));

        const enriched = mData.map((m) => ({
          ...m,
          availableSensors: m.availableSensors.map((id)=>sensorsById[id] ?? { _id:id, designation:"Unknown" }),
          sites: m.sites.map((id)=>sitesById[id] ?? "Unknown").join(", "),
        }));

        setMachines(enriched);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [debouncedSearch, statusFilter, gradeFilter]);

  /* Delete --------------------------------------- */
  const handleDelete = async (id) => {
    if (!confirm("Delete this machine?")) return;
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machines/${id}`, { method:"DELETE" });
      if (!r.ok) throw new Error("Failed to delete machine");
      setMachines((prev)=>prev.filter((m)=>m._id!==id));
    } catch (e) { setError(e.message); }
  };

  /* Colonnes ------------------------------------- */
  const columns = useMemo(()=>[
    { accessorKey:"name",      header:"Name" },
    { accessorKey:"mainPole",  header:"Main Pole" },
    { accessorKey:"subPole",   header:"Sub Pole" },
    { accessorKey:"status", header:"Status",
      cell:({row})=>{
        const st=row.getValue("status"); const [bg,txt]=colorByStatus(st);
        return <span className={`px-2 py-1 rounded-full text-xs ${bg} ${txt}`}>{st}</span>;
      }},
    { accessorKey:"pointsPerCycle", header:"Pts/Cycle" },
    { accessorKey:"maxUsers",       header:"Max" },
    { accessorKey:"requiredGrade",  header:"Required Grade",
      cell:({row})=><span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">{row.getValue("requiredGrade")}</span> },
    { accessorKey:"sites", header:"Installation Sites",
      cell:({row})=>(<div className="flex flex-wrap gap-1">
        {row.getValue("sites").split(", ").map((s,i)=>(<span key={i} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">{s}</span>))}
      </div>)},
    { accessorKey:"availableSensors", header:"Sensors",
      cell:({row})=>(<div className="flex flex-wrap gap-1">
        {row.getValue("availableSensors").map((s)=>(<span key={s._id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{s.designation}</span>))}
      </div>)},
    { accessorKey:"actions", header:"Actions",
      cell:({row})=><Button onClick={(e)=>{e.stopPropagation(); handleDelete(row.original._id);}}>Delete</Button>}
  ],[]);

  /* React-Table (✅ plugins invoqués) ------------- */
  const table = useReactTable({
    data: machines,
    columns,
    getCoreRowModel:       getCoreRowModel(),       // ← () !!
    getPaginationRowModel: getPaginationRowModel(), // ← () !!
    initialState:{ pagination:{ pageSize:10 } }
  });

  /* Grades pour filtre -------------------------------------------- */
  const grades = useMemo(()=>[...new Set(machines.map((m)=>m.requiredGrade).filter(Boolean))],[machines]);

  /* Render -------------------------------------------------------- */
  return (
    <div className="container mx-auto px-4 py-8">
      {error && <Alert type="error" message={error} onClose={()=>setError("")}/>}

      <div className="flex items-center space-x-4 mb-8">
        <div className="w-8 h-8 bg-blue-500 rounded"/><h1 className="text-3xl font-bold">Machines</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
          <Input placeholder="Search machines..." value={search} onChange={(e)=>setSearch(e.target.value)} className="pl-10"/>
        </div>

        <Select onValueChange={setGradeFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by grade"/></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All grades</SelectItem>
            {grades.map((g)=><SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by status"/></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="in-use">In Use</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? <Loading/> : machines.length===0 ? <NoData message="No machines found"/> : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg)=>(
                  <TableRow key={hg.id}>
                    {hg.headers.map((h)=><TableHead key={h.id}>{flexRender(h.column.columnDef.header,h.getContext())}</TableHead>)}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row)=>(
                  <TableRow key={row.id} className="cursor-pointer hover:bg-gray-50"
                    onClick={()=>router.push(`/machines/${row.original._id}`)}>
                    {row.getVisibleCells().map((cell)=>(
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell,cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm"
              onClick={()=>table.previousPage()}
              disabled={!table.getCanPreviousPage()}>Previous</Button>
            <Button variant="outline" size="sm"
              onClick={()=>table.nextPage()}
              disabled={!table.getCanNextPage()}>Next</Button>
          </div>

          <div className="flex justify-end mt-4">
            <Link href="/machinesForm"><Button variant="primary">Add New Machine</Button></Link>
          </div>
        </>
      )}
    </div>
  );
}
