"use client"
import { useRouter } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
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
    RefreshCw,
    ArrowUpDown,
    Eye,
    Gauge,
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
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import Alert from "@/components/alert"
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

export default function SensorsPage() {
    const [sensors, setSensors] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [globalFilter, setGlobalFilter] = useState("")
    const [sorting, setSorting] = useState([])
    const [isRefreshing, setIsRefreshing] = useState(false)

    const router = useRouter()
    const { user } = useUser()
    const isAdmin = user?.admin === true

    const { toastSuccess, toastError } = useToastAlert()

    const fetchSensors = async (showRefreshing = false) => {
        if (showRefreshing) setIsRefreshing(true)

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sensors`, {
                credentials: 'include'
            })
            if (!response.ok) throw new Error("Failed to fetch sensors")
            const data = await response.json()

            // Map the requiredGrade id to its name
            const gradesMap = sensors.reduce((acc, sensor) => {
                acc[sensor._id] = sensor.designation
                return acc
            }, {})

            const updatedSensors = data.map((sensor) => ({
                ...sensor,
                requiredGrade: Array.isArray(sensor.requiredGrade)
                    ? sensor.requiredGrade.map((gradeId) => gradesMap[gradeId] || "Unknown grade").join(", ")
                    : sensor.requiredGrade || "None",
            }))

            setSensors(updatedSensors)
            if (showRefreshing) {
                toastSuccess("Sensor list has been updated")
            }
        } catch (err) {
            toastError(err.message)
            setError(err.message)
        } finally {
            setLoading(false)
            if (showRefreshing) setIsRefreshing(false)
        }
    }

    useEffect(() => {
        fetchSensors()
    }, [])

    useEffect(() => {
        if (user === false) {
            router.replace("/login")
            return
        }
    }, [user, router])

    const handleDelete = async (sensorId) => {
        if (window.confirm("Are you sure you want to delete this sensor?")) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sensors/${sensorId}`, {
                    method: "DELETE",
                    credentials: 'include'
                })

                if (!response.ok) throw new Error("Failed to delete sensor")

                setSensors(sensors.filter((sensor) => sensor._id !== sensorId))
                toastSuccess("Sensor has been deleted")
            } catch (err) {
                toastError(err.message)
                setError(err.message)
            }
        }
    }

    const columns = useMemo(
        () => [
            {
                accessorKey: "designation",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        className="p-0 hover:bg-transparent flex items-center gap-1"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Designation
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                ),
                cell: ({ row }) => <div className="font-medium">{row.getValue("designation")}</div>,
            },
            {
                accessorKey: "requiredGrade",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        className="p-0 hover:bg-transparent flex items-center gap-1"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Required Grade
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <div className="flex flex-wrap gap-1">
                        {row
                            .getValue("requiredGrade")
                            .split(", ")
                            .map((grade, index) => (
                                <AnimatedBadge key={index} color="purple">
                                    {grade}
                                </AnimatedBadge>
                            ))}
                    </div>
                ),
            },
            {
                accessorKey: "supplier",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        className="p-0 hover:bg-transparent flex items-center gap-1"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Supplier
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                ),
                cell: ({ row }) => <div>{row.getValue("supplier") || "N/A"}</div>,
            },
            {
                accessorKey: "CreatedAt",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        className="p-0 hover:bg-transparent flex items-center gap-1"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Created At
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                ),
                cell: ({ row }) => <div>{new Date(row.getValue("CreatedAt")).toLocaleDateString()}</div>,
            },
            ...(isAdmin
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
                                                        router.push(`/sensorsDetail/${row.original._id}`)
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
                                            <p>Delete sensor</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        ),
                    },
                ]
                : []),
        ],
        [sensors, isAdmin],
    )

    const table = useReactTable({
        data: sensors,
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

    if (user === undefined) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <motion.div
            className="container mx-auto px-4 py-8 h-full"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="mb-6"
                    >
                        <Alert type="error" message={error} onClose={() => setError(null)} />
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div className="flex items-center justify-between mb-8" variants={itemVariants}>
                <div className="flex items-center space-x-4">
                    <motion.div
                        className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Gauge className="h-6 w-6 text-primary-foreground" />
                    </motion.div>
                    <h1 className="text-3xl font-bold">Sensors</h1>
                </div>

                <div className="flex gap-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="outline"
                            onClick={() => fetchSensors(true)}
                            disabled={isRefreshing}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                            {isRefreshing ? "Refreshing..." : "Refresh"}
                        </Button>
                    </motion.div>

                    {isAdmin && (
                        <motion.div variants={fadeInVariants} whileHover={{ scale: 1.01 }}>
                            <Button
                                className="flex items-center gap-2"
                                onClick={() => router.push("/sensorsForm")}
                                data-navigation="true"
                            >
                                <Plus className="h-4 w-4" />
                                Add New Sensor
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
                            Search Sensors
                        </CardTitle>
                        <CardDescription>Find sensors by designation, grade, or supplier</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary-foreground" />
                                <Input
                                    placeholder="Search sensors..."
                                    value={globalFilter}
                                    onChange={(e) => setGlobalFilter(e.target.value)}
                                    className="pl-10"
                                    aria-label="Search sensors"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
                {loading ? (
                    <TableSkeleton columns={columns.length} />
                ) : sensors.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                        <NoData message="No sensors available" />
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
                                                    onClick={() => router.push(`/sensorsDetail/${row.original._id}`)}
                                                    className="cursor-pointer"
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
                                of {table.getFilteredRowModel().rows.length} sensors
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
