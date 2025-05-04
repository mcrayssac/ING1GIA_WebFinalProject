"use client"

import { useEffect, useState, useCallback } from "react"
import { useUser } from "@/contexts/UserContext"
import { useToastAlert } from "@/contexts/ToastContext"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import {
    Ticket,
    Clock,
    Search,
    ChevronUp,
    ChevronDown,
    Filter,
    RefreshCw,
    Loader2,
    AlertCircle,
    Shield,
    ClipboardCheck,
    CheckCheck,
    XOctagon
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import NoData from "@/components/no-data"
import {
    getStatusBadge,
    getTicketTitle,
    getTicketDescription,
    getDetailedContent
} from "@/components/ticket-details"

// Animation variants
const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.4 }
    }
}

const slideUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 30
        }
    }
}

const containerAnimation = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            when: "beforeChildren",
            staggerChildren: 0.1,
            duration: 0.3
        }
    }
}

const cardAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 30
        }
    }
}

const ticketAnimation = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 30
        }
    },
    exit: {
        opacity: 0,
        scale: 0.9,
        transition: { duration: 0.2 }
    }
}

const loadingAnimation = {
    rotate: {
        rotate: 360,
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
        }
    }
}

const staggerAnimation = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.05
        }
    }
}

const iconAnimation = {
    initial: { scale: 1 },
    hover: {
        scale: 1.15,
        rotate: [0, -5, 10, -5, 0],
        transition: {
            duration: 0.5
        }
    }
}

const pulseAnimation = {
    pulse: {
        scale: [1, 1.05, 1],
        opacity: [0.9, 1, 0.9],
        transition: {
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
        }
    }
}

export default function MyTicketsPage() {
    const router = useRouter()
    const { user } = useUser()
    const { toastSuccess, toastError } = useToastAlert()
    const [tickets, setTickets] = useState([])
    const [filteredTickets, setFilteredTickets] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [sortOrder, setSortOrder] = useState("newest")
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
    const [selectedTicket, setSelectedTicket] = useState(null)
    const [refreshing, setRefreshing] = useState(false)

    const fetchTickets = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/tickets/user`, {
                method: "GET",
                credentials: "include",
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.message)
            setTickets(data)
            setFilteredTickets(data)
        } catch (error) {
            console.error(error)
            toastError("Failed to fetch tickets", { description: error.message })
        } finally {
            setIsLoading(false)
        }
    }, [toastError])

    const filterAndSortTickets = useCallback(() => {
        if (!tickets.length) return

        let filtered = [...tickets]

        // Apply status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter((ticket) => ticket.status === statusFilter)
        }

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter((ticket) => {
                // Handle different ticket types
                switch (ticket.type) {
                    case "GRADE_UPGRADE":
                        return (
                            ticket.currentGrade?.name?.toLowerCase().includes(term) ||
                            ticket.targetGrade?.name?.toLowerCase().includes(term)
                        )
                    case "MACHINE_CREATION":
                    case "MACHINE_DELETION":
                        return (
                            ticket.machineData?.name?.toLowerCase().includes(term) ||
                            ticket.machineData?.mainPole?.toLowerCase().includes(term)
                        )
                    default:
                        return false
                }
            })
        }

        // Apply sorting
        filtered.sort((a, b) => {
            if (sortOrder === "newest") {
                return new Date(b.createdAt) - new Date(a.createdAt)
            } else if (sortOrder === "oldest") {
                return new Date(a.createdAt) - new Date(b.createdAt)
            }
            return 0
        })

        setFilteredTickets(filtered)
    }, [tickets, searchTerm, statusFilter, sortOrder])

    useEffect(() => {
        if (user === false) {
            router.replace('/')
            return
        }
        if (user?.admin) {
            router.replace('/tickets')
            return
        }
        if (user) {
            fetchTickets()
        }
    }, [user, router, fetchTickets])

    useEffect(() => {
        filterAndSortTickets()
    }, [filterAndSortTickets])

    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), "PPP 'at' p")
        } catch (error) {
            return "Invalid date"
        }
    }

    const pendingCount = tickets.filter((ticket) => ticket.status === "PENDING").length
    const approvedCount = tickets.filter((ticket) => ticket.status === "APPROVED").length
    const rejectedCount = tickets.filter((ticket) => ticket.status === "REJECTED").length

    // Show loading state while user context is initializing
    if (user === undefined) {
        return (
            <motion.div
                className="flex items-center justify-center h-[calc(100vh-200px)]"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
            >
                <motion.div animate={loadingAnimation.rotate}>
                    <Loader2 className="h-8 w-8 text-muted-foreground" />
                </motion.div>
            </motion.div>
        )
    }

    // Show access denied if not authenticated
    if (user === false) {
        return (
            <motion.div
                className="flex flex-col items-center justify-center h-[calc(100vh-200px)] p-4"
                initial="hidden"
                animate="visible"
                variants={containerAnimation}
            >
                <motion.div
                    variants={slideUp}
                    whileHover={{
                        scale: 1.1,
                        rotate: [0, 10, -10, 0],
                        transition: { duration: 0.5 }
                    }}
                >
                    <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                </motion.div>
                <motion.h2
                    className="text-2xl font-bold mb-2"
                    variants={slideUp}
                >
                    Access Denied
                </motion.h2>
                <motion.p
                    className="text-muted-foreground text-center"
                    variants={slideUp}
                >
                    Please log in to view your tickets.
                </motion.p>
            </motion.div>
        )
    }

    return (
        <div className="p-4 space-y-6">
            {/* Header */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold">My Tickets</h1>
                    <p className="text-muted-foreground">View and track your requests</p>
                </div>
                <Button
                    onClick={() => {
                        setRefreshing(true)
                        fetchTickets().finally(() => setRefreshing(false))
                    }}
                    variant="outline"
                    disabled={refreshing}
                >
                    {refreshing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Refresh
                </Button>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerAnimation}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                <motion.div variants={cardAnimation}>
                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <motion.div
                                    initial={{ rotate: 0 }}
                                    animate={{ rotate: pendingCount > 0 ? [0, -10, 10, -10, 0] : 0 }}
                                    transition={{ duration: 1.5, repeat: pendingCount > 0 ? Infinity : 0, repeatDelay: 3 }}
                                >
                                    <Clock className="h-5 w-5 text-yellow-500" />
                                </motion.div>
                                <div>
                                    <CardTitle className="text-lg font-medium">Pending</CardTitle>
                                    <CardDescription>Awaiting admin review</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <motion.div
                                className="text-3xl font-bold"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    color: pendingCount > 0 ?
                                        ["rgba(var(--foreground))", "#eab308", "rgba(var(--foreground))"] :
                                        "rgba(var(--foreground))"
                                }}
                                transition={{
                                    duration: 0.7,
                                    color: { repeat: pendingCount > 0 ? Infinity : 0, repeatDelay: 2 }
                                }}
                            >
                                {isLoading ? "..." : pendingCount}
                            </motion.div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={cardAnimation}>
                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <motion.div
                                    animate={approvedCount > 0 ? "pulse" : "initial"}
                                    variants={pulseAnimation}
                                >
                                    <CheckCheck className="h-5 w-5 text-green-500" />
                                </motion.div>
                                <div>
                                    <CardTitle className="text-lg font-medium">Approved</CardTitle>
                                    <CardDescription>Successful requests</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <motion.div
                                className="text-3xl font-bold"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                {isLoading ? "..." : approvedCount}
                            </motion.div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={cardAnimation}>
                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <motion.div
                                    whileHover="hover"
                                    variants={iconAnimation}
                                >
                                    <XOctagon className="h-5 w-5 text-red-500" />
                                </motion.div>
                                <div>
                                    <CardTitle className="text-lg font-medium">Rejected</CardTitle>
                                    <CardDescription>Declined requests</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <motion.div
                                className="text-3xl font-bold"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                {isLoading ? "..." : rejectedCount}
                            </motion.div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            {/* Search and Filters */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={slideUp}
                className="flex flex-col md:flex-row gap-4"
            >
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tickets..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <div className="flex items-center">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Filter by status" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Status</SelectLabel>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="APPROVED">Approved</SelectItem>
                                <SelectItem value="REJECTED">Rejected</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger className="w-[180px]">
                            <div className="flex items-center">
                                {sortOrder === "newest" ? (
                                    <ChevronDown className="h-4 w-4 mr-2" />
                                ) : (
                                    <ChevronUp className="h-4 w-4 mr-2" />
                                )}
                                <SelectValue placeholder="Sort by" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Sort By</SelectLabel>
                                <SelectItem value="newest">Newest First</SelectItem>
                                <SelectItem value="oldest">Oldest First</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </motion.div>

            {/* Tickets List */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={slideUp}
            >
                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid grid-cols-4 mb-4">
                        <TabsTrigger value="all">
                            <motion.div className="flex items-center gap-1" whileHover={{ scale: 1.05 }}>
                                <ClipboardCheck className="h-4 w-4 mr-1" /> All
                            </motion.div>
                        </TabsTrigger>
                        <TabsTrigger value="PENDING" className="flex items-center gap-1">
                            <motion.div
                                className="flex items-center"
                                whileHover={{ scale: 1.05 }}
                                animate={pendingCount > 0 ? {
                                    scale: [1, 1.1, 1],
                                    transition: { repeat: Infinity, repeatDelay: 3, duration: 0.5 }
                                } : {}}
                            >
                                <Clock className="h-4 w-4 mr-1" /> Pending
                                {pendingCount > 0 && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 500,
                                            damping: 20
                                        }}
                                    >
                                        <Badge variant="secondary" className="ml-1">
                                            {pendingCount}
                                        </Badge>
                                    </motion.div>
                                )}
                            </motion.div>
                        </TabsTrigger>
                        <TabsTrigger value="APPROVED">
                            <motion.div className="flex items-center gap-1" whileHover={{ scale: 1.05 }}>
                                <CheckCheck className="h-4 w-4 mr-1" /> Approved
                            </motion.div>
                        </TabsTrigger>
                        <TabsTrigger value="REJECTED">
                            <motion.div className="flex items-center gap-1" whileHover={{ scale: 1.05 }}>
                                <XOctagon className="h-4 w-4 mr-1" /> Rejected
                            </motion.div>
                        </TabsTrigger>
                    </TabsList>

                    {["all", "PENDING", "APPROVED", "REJECTED"].map((tab) => (
                        <TabsContent key={tab} value={tab} className="mt-0">
                            {isLoading ? (
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    variants={staggerAnimation}
                                    className="space-y-4"
                                >
                                    {[1, 2, 3].map((i) => (
                                        <motion.div key={i} variants={ticketAnimation}>
                                            <Card>
                                                <CardContent className="p-6">
                                                    <div className="flex justify-between">
                                                        <div className="space-y-2">
                                                            <Skeleton className="h-4 w-[250px]" />
                                                            <Skeleton className="h-4 w-[200px]" />
                                                            <Skeleton className="h-4 w-[150px]" />
                                                        </div>
                                                        <Skeleton className="h-6 w-24" />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <ScrollArea className="h-[calc(100vh-450px)]">
                                    <motion.div
                                        initial="hidden"
                                        animate="visible"
                                        variants={staggerAnimation}
                                        className="space-y-4"
                                    >
                                        {filteredTickets
                                            .filter((ticket) => tab === "all" || ticket.status === tab)
                                            .map((ticket) => (
                                                <motion.div
                                                    key={ticket._id}
                                                    variants={ticketAnimation}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="exit"
                                                    layout
                                                    layoutId={ticket._id}
                                                >
                                                    <Card className="overflow-hidden">
                                                        <CardContent className="p-6">
                                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <motion.div whileHover={{ rotate: 20 }}>
                                                                            <Ticket className="h-5 w-5 text-muted-foreground" />
                                                                        </motion.div>
                                                                        <h3 className="font-medium text-lg">
                                                                            {getTicketTitle(ticket)}
                                                                        </h3>
                                                                        <motion.div whileHover={{ scale: 1.1 }}>
                                                                            {getStatusBadge(ticket.status)}
                                                                        </motion.div>
                                                                    </div>
                                                                    {getTicketDescription(ticket)}
                                                                    <p className="text-sm text-muted-foreground">
                                                                        Created: {formatDate(ticket.createdAt)}
                                                                    </p>
                                                                    {ticket.processedAt && (
                                                                        <p className="text-sm text-muted-foreground">
                                                                            Processed: {formatDate(ticket.processedAt)}
                                                                        </p>
                                                                    )}
                                                                    {ticket.reason && (
                                                                        <motion.div
                                                                            className="flex items-start mt-2 p-2 bg-red-50 border border-red-100 rounded-md"
                                                                            initial={{ opacity: 0, height: 0 }}
                                                                            animate={{ opacity: 1, height: "auto" }}
                                                                            transition={{ duration: 0.3 }}
                                                                        >
                                                                            <motion.div
                                                                                animate={{
                                                                                    rotate: [0, 10, -10, 0],
                                                                                    transition: { repeat: Infinity, repeatDelay: 5 }
                                                                                }}
                                                                            >
                                                                                <AlertCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                                                                            </motion.div>
                                                                            <p className="text-sm text-red-600">
                                                                                Reason: {ticket.reason}
                                                                            </p>
                                                                        </motion.div>
                                                                    )}
                                                                </div>
                                                                <motion.div
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                >
                                                                    <Button
                                                                        variant="default"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            setSelectedTicket(ticket)
                                                                            setDetailsDialogOpen(true)
                                                                        }}
                                                                        className="bg-cyan-600 hover:bg-cyan-700 whitespace-nowrap"
                                                                    >
                                                                        View Details
                                                                    </Button>
                                                                </motion.div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </motion.div>
                                            ))}

                                        {filteredTickets.filter((ticket) => tab === "all" || ticket.status === tab)
                                            .length === 0 && (
                                                <NoData message={`No ${tab !== "all" ? tab.toLowerCase() : ""} tickets found`} />
                                            )}
                                    </motion.div>
                                </ScrollArea>
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            </motion.div>

            {/* Details Dialog */}
            <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{selectedTicket && getTicketTitle(selectedTicket)}</DialogTitle>
                        <DialogDescription>Complete information about your request</DialogDescription>
                    </DialogHeader>
                    {selectedTicket && (
                        <motion.div
                            className="space-y-4"
                            initial="hidden"
                            animate="visible"
                            variants={containerAnimation}
                        >
                            <motion.div className="flex justify-between items-center" variants={slideUp}>
                                <h3 className="font-medium">Status</h3>
                                <motion.div whileHover={{ scale: 1.05 }}>
                                    {getStatusBadge(selectedTicket.status)}
                                </motion.div>
                            </motion.div>

                            <motion.div className="flex justify-between items-center" variants={slideUp}>
                                {getDetailedContent(selectedTicket)}
                            </motion.div>

                            <motion.div className="space-y-2" variants={slideUp}>
                                <h3 className="font-medium">Timestamps</h3>
                                <motion.div
                                    className="bg-muted p-3 rounded-md space-y-1"
                                    whileHover={{
                                        backgroundColor: "rgba(var(--muted), 0.7)",
                                        transition: { duration: 0.2 }
                                    }}
                                >
                                    <p className="text-sm">
                                        Created: <span className="font-medium">{formatDate(selectedTicket.createdAt)}</span>
                                    </p>
                                    {selectedTicket.processedAt && (
                                        <motion.p
                                            className="text-sm"
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            Processed:{" "}
                                            <span className="font-medium">{formatDate(selectedTicket.processedAt)}</span>
                                        </motion.p>
                                    )}
                                </motion.div>
                            </motion.div>

                            {selectedTicket.reason && (
                                <motion.div
                                    className="space-y-2"
                                    variants={slideUp}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                >
                                    <h3 className="font-medium">Rejection Reason</h3>
                                    <motion.div
                                        className="bg-red-50 border border-red-100 p-3 rounded-md"
                                        animate={{
                                            boxShadow: [
                                                "0 0 0 rgba(220, 38, 38, 0)",
                                                "0 0 8px rgba(220, 38, 38, 0.3)",
                                                "0 0 0 rgba(220, 38, 38, 0)"
                                            ]
                                        }}
                                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                                    >
                                        <p className="text-sm text-red-600">{selectedTicket.reason}</p>
                                    </motion.div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                    <DialogFooter>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
                        </motion.div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
