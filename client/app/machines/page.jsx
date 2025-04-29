"use client";
import Link from "next/link";  
import { useRouter } from "next/navigation"; 
import React, { useEffect, useState, useMemo } from "react";
import { Search } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Loading from "@/components/loading";
import Alert from "@/components/alert";
import NoData from "@/components/no-data";

export default function MachinesPage() {
  const router = useRouter(); // 🧠
  const [machinesData, setMachinesData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machines`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch machines");
        return res.json();
      })
      .then((data) => {
        setMachinesData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const columns = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "mainPole",
      header: "Main Pole",
    },
    {
      accessorKey: "subPole",
      header: "Sub Pole",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
          {row.getValue("status")}
        </span>
      ),
    },
    {
      accessorKey: "pointsPerCycle",
      header: "Points/Cycle",
    },
    {
      accessorKey: "maxUsers",
      header: "Max Users",
    },
    {
      accessorKey: "requiredGrade",
      header: "Required Grade",
      cell: ({ row }) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
          {row.getValue("requiredGrade")}
        </span>
      ),
    },
    {
      accessorKey: "availableSensors",
      header: "Sensors",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.getValue("availableSensors")?.map((sensor) => (
            <span
              key={sensor.designation}
              className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs"
            >
              {sensor.designation}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "currentUsers",
      header: "Active Users",
      cell: ({ row }) => (
        <span className={row.getValue("currentUsers")?.length > 0 ? "text-green-600" : "text-gray-400"}>
          {row.getValue("currentUsers")?.length}/{row.original.maxUsers}
        </span>
      ),
    },
  ];

  const table = useReactTable({
    data: machinesData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const [globalFilter, setGlobalFilter] = useState("");
  useEffect(() => {
    table.setGlobalFilter(globalFilter);
  }, [globalFilter, table]);

  const teams = useMemo(() => 
    [...new Set(machinesData.map(m => m.requiredGrade).filter(Boolean))], 
    [machinesData]
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {error && <Alert type="error" message={error} onClose={() => setError("")} />}

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-blue-500 rounded" />
          <h1 className="text-3xl font-bold">Machines</h1>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search machines..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          onValueChange={(value) => {
            table.getColumn("requiredGrade")?.setFilterValue(value === "all" ? undefined : value);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Technicien">Technicien</SelectItem>
            <SelectItem value="Technicien Confirmé">Technicien Confirmé</SelectItem>
            <SelectItem value="Ingénieur">Ingénieur</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) => {
            table.getColumn("status")?.setFilterValue(value === "all" ? undefined : value);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="in-use">In Use</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <Loading />
      ) : machinesData.length === 0 ? (
        <NoData message="No machines available" />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="cursor-pointer hover:bg-gray-100" // 🧠 petit effet hover
                      onClick={() => router.push(`/machines/${row.original._id}`)} // 👈
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>

          <div className="flex justify-end mt-4">
            <Link href="/machinesForm">
              <Button variant="primary">Add a New Machine</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
