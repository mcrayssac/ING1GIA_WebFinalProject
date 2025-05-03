"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loading from "@/components/loading";
import Alert from "@/components/alert";
import NoData from "@/components/no-data";
import { useUser } from "@/contexts/UserContext";
import { Loader2 } from "lucide-react";
export default function SensorsPage() {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");

  const router = useRouter();
  const { user } = useUser();
  const isAdmin = user?.admin === true;

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sensors`);
        if (!response.ok) throw new Error("Failed to fetch sensors");
        const data = await response.json();
        setSensors(data);
        // Map the requiredGrade id to its name
        const gradesMap = sensors.reduce((acc, sensor) => {
          acc[sensor._id] = sensor.designation;
          return acc;
        }, {});
        const updatedSensors = data.map(sensor => ({
          ...sensor,
          requiredGrade: sensor.requiredGrade.map(gradeId => gradesMap[gradeId] || 'Unknown grade'),
        }));
        setSensors(updatedSensors);
      } finally {
        setLoading(false);
      }
    };

    fetchSensors();
  }, []);
  useEffect(() => {
    if (user === false) {
        router.replace('/login')
        return
    }
}, [user, router]) 

  const handleDelete = async (sensorId) => {
    if (window.confirm("Are you sure you want to delete this sensor?")) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sensors/${sensorId}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete sensor");

        setSensors(sensors.filter((sensor) => sensor._id !== sensorId));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "designation",
        header: "Designation",
      },
      {
        accessorKey: "requiredGrade",
        header: "Required Grade",
      },
      {
        accessorKey: "supplier",
        header: "Supplier",
        cell: ({ row }) => row.getValue("supplier") || "N/A",
      },
      {
        accessorKey: "CreatedAt",
        header: "Created At",
        cell: ({ row }) => new Date(row.getValue("CreatedAt")).toLocaleDateString(),
      },
      ...(isAdmin
        ? [
            {
              accessorKey: "actions",
              header: "Actions",
              cell: ({ row }) => (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(row.original._id);
                  }}
                >
                  Delete
                </Button>
              ),
            },
          ]
        : []),
    ],
    [sensors, isAdmin]
  );

  const table = useReactTable({
    data: sensors,
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

  useEffect(() => {
    table.setGlobalFilter(globalFilter);
  }, [globalFilter, table]);

  
  if (user === undefined) {
    return (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Sensors List</h1>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          placeholder="Search sensors..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {loading ? (
        <Loading />
      ) : sensors.length === 0 ? (
        <NoData message="No sensors available" />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
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
                      onClick={() => router.push(`/sensorsDetail/${row.original._id}`)}
                      className="cursor-pointer"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
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
          {isAdmin && (
            <div className="flex justify-start mt-4">
                <Button
                    variant="default"
                    size="sm"
                    onClick={() => router.push("/sensorsForm")}
                    data-navigation="true"
                >
                    Add a New Sensor
                </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
