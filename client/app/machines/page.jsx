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
import { useUser } from "@/contexts/UserContext";
import { Loader2 } from "lucide-react";

export default function MachinesPage() {
  
  const [machinesData, setMachinesData] = useState([]);
  const [sensorsData, setSensorsData] = useState([]);
  const [sitesData, setSitesData] = useState([]);
  // const [usersData, setUsersData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");

  const { user } = useUser();
  const router = useRouter();
  const isAdmin = user?.admin === true;

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [machinesRes, sensorsRes, sitesRes, usersRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machines`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sensors`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sites`),
          // fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/users`)
        ]);

        if (!machinesRes.ok) throw new Error("Failed to fetch machines");
        if (!sensorsRes.ok) throw new Error("Failed to fetch sensors");
        if (!sitesRes.ok) throw new Error("Failed to fetch sites");
        // if (!usersRes.ok) throw new Error("Failed to fetch users");

        const [machines, sensors, sites, users] = await Promise.all([
          machinesRes.json(),
          sensorsRes.json(),
          sitesRes.json(),
          // usersRes.json()
        ]);

        // Enrich machine data with related entities
        const enrichedMachines = machines.map(machine => ({
          ...machine,
          // Map sensor IDs to sensor objects
          availableSensors: machine.availableSensors.map(sensorId => 
            sensors.find(s => s._id === sensorId) || { _id: sensorId, designation: 'Unknown' }
          ),
          //Map requiredGrade IDs to machince objects
          
          // Map site IDs to site names
          sites: machine.sites.map(siteId => 
            sites.find(s => s._id === siteId)?.name || 'Unknown site'
          ).join(', '),
          // Map user IDs to user names
          currentUsers: machine.currentUsers.map(userId => 
            users.find(u => u._id === userId)?.name || 'Unknown user'
          )
        }));

        setMachinesData(enrichedMachines);
        setSensorsData(sensors);
        setSitesData(sites);
        // setUsersData(users);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    if (user === false) {
      
        router.replace('/login')
        return
    }
 
}, [user, router])

  const handleDelete = async (machineId) => {
    if (window.confirm("Are you sure you want to delete this machine?")) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machines/${machineId}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete machine");

        setMachinesData(machinesData.filter((machine) => machine._id !== machineId));
      } catch (err) {
        setError(err.message);
      }
    }
  }

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
      cell: ({ row }) => {
        const status = row.getValue("status");
        let bgColor, textColor;
        
        switch(status) {
          case 'available':
            bgColor = 'bg-green-100';
            textColor = 'text-green-800';
            break;
          case 'in-use':
            bgColor = 'bg-yellow-100';
            textColor = 'text-yellow-800';
            break;
          case 'blocked':
            bgColor = 'bg-red-100';
            textColor = 'text-red-800';
            break;
          default:
            bgColor = 'bg-gray-100';
            textColor = 'text-gray-800';
        }
        
        return (
          <span className={`px-2 py-1 ${bgColor} ${textColor} rounded-full text-xs`}>
            {status}
          </span>
        );
            },
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
        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
          {row.getValue("requiredGrade")}
        </span>
            ),
          },
          {
            accessorKey: "sites",
            header: "Installation Sites",
            cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.getValue("sites").split(', ').map((site, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
              {site}
            </span>
          ))}
        </div>
            ),
          },
          {
            accessorKey: "availableSensors",
            header: "Sensors",
            cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.getValue("availableSensors").map((sensor) => (
            <span
              key={sensor._id}
              className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
            >
              {sensor.designation}
            </span>
          ))}
        </div>
            ),
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
            table.getColumn("status")?.setFilterValue(value === "all" ? undefined : value);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
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
                      onClick={() => router.push(`/machinesDetail/${row.original._id}`)}
                      className="cursor-pointer hover:bg-gray-50"
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
          {isAdmin && (
            <div className="flex items-center justify-start space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/machinesForm")}
              >
                Add New Machine
              </Button>
            </div>
          )}
          
        </>
      )}
    </div>
  );
}