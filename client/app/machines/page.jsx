"use client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Plus,
    Trash2,
    Loader2,
    AlertCircle,
    Info,
    RefreshCw,
    Cpu,
    ArrowUpDown,
    Eye,
} from "lucide-react"
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
    getSortedRowModel,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import NoData from "@/components/no-data"
import { useUser } from "@/contexts/UserContext"
import { useToastAlert } from "@/contexts/ToastContext"

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
}

const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.5,
            when: "beforeChildren",
            staggerChildren: 0.05,
        },
    },
}

const rowVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
}

const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
}

// Status badge component with animations
const StatusBadge = ({ status }) => {
    let bgColor, textColor, icon

    switch (status) {
        case "available":
            bgColor = "bg-green-100"
            textColor = "text-green-800"
            icon = <CheckCircle className="w-3 h-3 mr-1" />
            break
        case "in-use":
            bgColor = "bg-yellow-100"
            textColor = "text-yellow-800"
            icon = <Clock className="w-3 h-3 mr-1" />
            break
        case "blocked":
            bgColor = "bg-red-100"
            textColor = "text-red-800"
            icon = <XCircle className="w-3 h-3 mr-1" />
            break
        default:
            bgColor = "bg-gray-100"
            textColor = "text-gray-800"
            icon = <Info className="w-3 h-3 mr-1" />
    }

    return (
        <motion.span
            className={`inline-flex items-center px-2 py-1 ${bgColor} ${textColor} rounded-full text-xs font-medium`}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
        >
            {status}
        </motion.span>
    )
}

// Custom badge component with animations
const AnimatedBadge = ({ children, color = "blue" }) => {
    const colors = {
        blue: "bg-blue-100 text-blue-800",
        gray: "bg-gray-100 text-gray-800",
        purple: "bg-purple-100 text-purple-800",
        green: "bg-green-100 text-green-800",
        yellow: "bg-yellow-100 text-yellow-800",
        red: "bg-red-100 text-red-800",
    }

    return (
        <motion.span
            className={`px-2 py-1 ${colors[color]} rounded-full text-xs font-medium`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
        >
            {children}
        </motion.span>
    )
}

// Loading skeleton for table
const TableSkeleton = ({ columns }) => (
    <div className="rounded-md border">
        <Table>
            <TableHeader>
                <TableRow>
                    {Array(columns)
                        .fill(0)
                        .map((_, i) => (
                            <TableHead key={i}>
                                <Skeleton className="h-6 w-full" />
                            </TableHead>
                        ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {Array(5)
                    .fill(0)
                    .map((_, i) => (
                        <TableRow key={i}>
                            {Array(columns)
                                .fill(0)
                                .map((_, j) => (
                                    <TableCell key={j}>
                                        <Skeleton className="h-6 w-full" />
                                    </TableCell>
                                ))}
                        </TableRow>
                    ))}
            </TableBody>
        </Table>
    </div>
)

// Import missing components
const CheckCircle = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
)

const XCircle = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
)

const Clock = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
)

export default function MachinesPage() {
    const [machinesData, setMachinesData] = useState([])
    const [loading, setLoading] = useState(true)
    const [globalFilter, setGlobalFilter] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [sorting, setSorting] = useState([])
    const [isRefreshing, setIsRefreshing] = useState(false)

    const { user } = useUser()
    const { toastSuccess, toastError } = useToastAlert()
    const router = useRouter()
    const canSeeMachineActions = user?.admin || ['Engineer', 'Manager', 'Technician'].includes(user?.grade?.name)

    const fetchData = async (showRefreshing = false) => {
        if (showRefreshing) setIsRefreshing(true);
        try {
            const machinesRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machines`, {
                credentials: "include",
            });
            if (!machinesRes.ok) throw new Error("Failed to fetch machines");

            const machines = await machinesRes.json();
            setMachinesData(machines);
        } catch (err) {
            console.error(err);
            toastError("Failed to fetch machines");
        } finally {
            setLoading(false)
            if (showRefreshing) setIsRefreshing(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        if (user === false) {
            router.replace("/login")
            return
        }
    }, [user, router])

    const handleDelete = async (machineId) => {
        if (window.confirm("Are you sure you want to delete this machine?")) {
            try {
                if (user?.admin) {
                    // Direct deletion for admin users and engineers/managers
                    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machines/${machineId}`, {
                        method: "DELETE",
                        credentials: "include"
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Failed to delete machine");
                    }

                    setMachinesData(machinesData.filter((machine) => machine._id !== machineId));
                    toastSuccess("Machine deleted successfully");
                } else if (canSeeMachineActions) {
                    // Create a deletion request for non-admin users
                    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/tickets`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify({
                            type: "MACHINE_DELETION",
                            machineId
                        })
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Failed to create deletion request");
                    }

                    toastSuccess("Deletion request submitted for admin approval");
                } else {
                    // Show a message to the user
                    toastError("You do not have permission to delete this machine.");
                }
            } catch (err) {
                console.error(err)
                toastError(err.message);
            }
        }
    }

    const columns = [
        {
            accessorKey: "name",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="p-0 hover:bg-transparent flex items-center gap-1"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
        },
        {
            accessorKey: "mainPole",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="p-0 hover:bg-transparent flex items-center gap-1"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Main Pole
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            ),
        },
        {
            accessorKey: "subPole",
            header: "Sub Pole",
        },
        {
            accessorKey: "status",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="p-0 hover:bg-transparent flex items-center gap-1"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Status
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
        },
        {
            accessorKey: "pointsPerCycle",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="p-0 hover:bg-transparent flex items-center gap-1"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Points/Cycle
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => <div className="text-right font-medium">{row.getValue("pointsPerCycle")}</div>,
        },
        {
            accessorKey: "maxUsers",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="p-0 hover:bg-transparent flex items-center gap-1"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Max Users
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => <div className="text-right font-medium">{row.getValue("maxUsers")}</div>,
        },
        {
            accessorKey: "requiredGrade",
            header: "Required Grade",
            cell: ({ row }) => <AnimatedBadge color="purple">{row.getValue("requiredGrade")}</AnimatedBadge>,
        },
        {
            accessorKey: "site",
            header: "Installation Site",
            cell: ({ row }) => (
                <AnimatedBadge color="gray">
                    {row.original.site?.name || "Unknown site"}
                </AnimatedBadge>
            ),
        },
        {
            accessorKey: "availableSensors",
            header: "Sensors",
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1">
                    {row.getValue("availableSensors").map((sensor) => (
                        <AnimatedBadge key={sensor._id} color="blue">
                            {sensor.designation}
                        </AnimatedBadge>
                    ))}
                </div>
            ),
        },
        ...(canSeeMachineActions
            ? [
                {
                    accessorKey: "actions",
                    header: "Actions",
                    cell: ({ row }) => (
                        <div className="flex items-center gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    router.push(`/machines/${row.original._id}`)
                                                }}
                                                data-navigation="true"
                                                className="h-8 w-8"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </motion.div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>View details</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDelete(row.original._id)
                                                }}
                                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </motion.div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Delete machine</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    ),
                },
            ]
            : []),
    ]

    const table = useReactTable({
        data: machinesData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: {
            globalFilter,
            sorting,
        },
        onSortingChange: setSorting,
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    })

    useEffect(() => {
        table.setGlobalFilter(globalFilter)
    }, [globalFilter, table])

    // Apply status filter
    useEffect(() => {
        if (statusFilter !== "all") {
            table.getColumn("status")?.setFilterValue(statusFilter)
        } else {
            table.getColumn("status")?.setFilterValue(undefined)
        }
    }, [statusFilter, table])

    if (user === undefined) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <motion.div className="container mx-auto px-4 py-8 h-full" initial="hidden" animate="visible" variants={containerVariants}>
            <motion.div className="flex items-center justify-between mb-8" variants={itemVariants}>
                <div className="flex items-center space-x-4">
                    <motion.div
                        className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Cpu className="h-6 w-6 text-primary-foreground" />
                    </motion.div>
                    <h1 className="text-3xl font-bold">Machines</h1>
                </div>


                <div className="flex gap-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="outline"
                            onClick={() => fetchData(true)}
                            disabled={isRefreshing}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                            {isRefreshing ? "Refreshing..." : "Refresh"}
                        </Button>
                    </motion.div>

                    {canSeeMachineActions && (
                        <motion.div
                            variants={fadeInVariants}
                            whileHover={{ scale: 1.01 }}
                        >
                            <Button
                                className="flex items-center gap-2"
                                onClick={() => router.push("/machines/formulaire")}
                                data-navigation="true"
                            >
                                <Plus className="h-4 w-4" />
                                Add New Machine
                            </Button>
                        </motion.div>
                    )}
                </div>

            </motion.div>

            <motion.div className="mb-6" variants={itemVariants}>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters & Search
                        </CardTitle>
                        <CardDescription>Find and filter machines based on various criteria</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary-foreground" />
                                <Input
                                    placeholder="Search machines by name, pole, site..."
                                    value={globalFilter}
                                    onChange={(e) => setGlobalFilter(e.target.value)}
                                    className="pl-10"
                                    aria-label="Search machines"
                                />
                            </div>

                            <div className="flex gap-4">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[180px]" aria-label="Filter by status">
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
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
                {loading ? (
                    <TableSkeleton columns={columns.length} />
                ) : machinesData.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                        <NoData message="No machines available" />
                    </motion.div>
                ) : (
                    <>
                        <motion.div className="rounded-md border overflow-hidden" variants={tableVariants}>
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
                                    <AnimatePresence>
                                        {table.getRowModel().rows?.length ? (
                                            table.getRowModel().rows.map((row) => (
                                                <motion.tr
                                                    key={row.id}
                                                    variants={rowVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="hidden"
                                                    whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    {row.getVisibleCells().map((cell) => (
                                                        <TableCell key={cell.id}>
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </TableCell>
                                                    ))}
                                                </motion.tr>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ duration: 0.5 }}
                                                        className="flex flex-col items-center justify-center gap-2 py-8"
                                                    >
                                                        <AlertCircle className="h-8 w-8 text-muted-foreground" />
                                                        <p className="text-muted-foreground">No results found.</p>
                                                    </motion.div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </motion.div>

                        <motion.div className="flex items-center justify-between py-4" variants={fadeInVariants}>
                            <div className="flex-1 text-sm text-muted-foreground">
                                Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
                                {Math.min(
                                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                                    table.getFilteredRowModel().rows.length,
                                )}{" "}
                                of {table.getFilteredRowModel().rows.length} machines
                            </div>

                            <div className="flex items-center space-x-2">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => table.previousPage()}
                                                    disabled={!table.getCanPreviousPage()}
                                                    aria-label="Previous page"
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                            </motion.div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Previous page</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <span className="text-sm font-medium">
                                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                                </span>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => table.nextPage()}
                                                    disabled={!table.getCanNextPage()}
                                                    aria-label="Next page"
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </motion.div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Next page</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </motion.div>
                    </>
                )}
            </motion.div>
        </motion.div>
    )
}
