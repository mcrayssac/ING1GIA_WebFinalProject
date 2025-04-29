"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/contexts/UserContext"
import { useToastAlert } from "@/contexts/ToastContext"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
    Ticket,
    CheckCircle,
    XCircle,
    Clock,
    Filter,
    RefreshCw,
    Search,
    ChevronUp,
    ChevronDown,
    Loader2,
    AlertCircle,
    Shield,
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
import { Textarea } from "@/components/ui/textarea"
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

export default function TicketsPage() {
    const router = useRouter()
    const { user } = useUser()
    const { toastSuccess, toastError } = useToastAlert()
    const [tickets, setTickets] = useState([])

    useEffect(() => {
        if (!user?.admin) {
            router.push('/')
        }
    }, [user, router])

    // Show nothing while checking admin status and redirecting
    if (!user?.admin) return null;
    const [filteredTickets, setFilteredTickets] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [sortOrder, setSortOrder] = useState("newest")
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
    const [selectedTicket, setSelectedTicket] = useState(null)
    const [rejectionReason, setRejectionReason] = useState("")
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        fetchTickets()
    }, [])

    useEffect(() => {
        filterAndSortTickets()
    }, [tickets, searchTerm, statusFilter, sortOrder])

    const fetchTickets = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/tickets`, {
                method: "GET",
                credentials: "include",
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.message)
            setTickets(data)
        } catch (error) {
            console.error(error)
            toastError("Failed to fetch tickets", { description: error.message })
        } finally {
            setIsLoading(false)
        }
    }

    const refreshTickets = async () => {
        setRefreshing(true)
        await fetchTickets()
        setRefreshing(false)
    }

    const filterAndSortTickets = () => {
        let filtered = [...tickets]

        // Apply status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter((ticket) => ticket.status === statusFilter)
        }

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(
                (ticket) =>
                    (ticket.userId?.username && ticket.userId.username.toLowerCase().includes(term)) ||
                    (ticket.currentGrade?.name && ticket.currentGrade.name.toLowerCase().includes(term)) ||
                    (ticket.targetGrade?.name && ticket.targetGrade.name.toLowerCase().includes(term)) ||
                    (ticket.reason && ticket.reason.toLowerCase().includes(term)),
            )
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
    }

    const handleTicket = async (ticketId, status, reason = "") => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/tickets/${ticketId}`, {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status, reason }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message)
            }

            await fetchTickets()
            toastSuccess(`Ticket ${status.toLowerCase()} successfully`)
            setRejectDialogOpen(false)
            setRejectionReason("")
        } catch (error) {
            console.error(error)
            toastError("Failed to process ticket", { description: error.message })
        }
    }

    const openRejectDialog = (ticket) => {
        setSelectedTicket(ticket)
        setRejectDialogOpen(true)
    }

    const openDetailsDialog = (ticket) => {
        setSelectedTicket(ticket)
        setDetailsDialogOpen(true)
    }

    const handleReject = () => {
        if (!rejectionReason.trim()) {
            toastError("Please provide a reason for rejection")
            return
        }
        handleTicket(selectedTicket._id, "REJECTED", rejectionReason)
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case "PENDING":
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                    </Badge>
                )
            case "APPROVED":
                return (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approved
                    </Badge>
                )
            case "REJECTED":
                return (
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                        <XCircle className="w-3 h-3 mr-1" />
                        Rejected
                    </Badge>
                )
            default:
                return (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                        Unknown
                    </Badge>
                )
        }
    }

    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), "PPP 'at' p")
        } catch (error) {
            return "Invalid date"
        }
    }

    if (!user?.admin) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] p-4">
                <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                <p className="text-muted-foreground text-center">
                    You don't have permission to access this page. Please contact an administrator if you believe this is an
                    error.
                </p>
            </div>
        )
    }

    const pendingCount = tickets.filter((ticket) => ticket.status === "PENDING").length
    const approvedCount = tickets.filter((ticket) => ticket.status === "APPROVED").length
    const rejectedCount = tickets.filter((ticket) => ticket.status === "REJECTED").length

    return (
        <div className="p-4 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Ticket Management</h1>
                    <p className="text-muted-foreground">Review and process grade upgrade requests</p>
                </div>
                <Button onClick={refreshTickets} variant="outline" disabled={refreshing}>
                    {refreshing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                    Refresh
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium">Pending</CardTitle>
                        <CardDescription>Tickets awaiting review</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{isLoading ? "..." : pendingCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium">Approved</CardTitle>
                        <CardDescription>Successfully processed tickets</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{isLoading ? "..." : approvedCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium">Rejected</CardTitle>
                        <CardDescription>Declined upgrade requests</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{isLoading ? "..." : rejectedCount}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by username, grade, or reason..."
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
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending" className="flex items-center gap-2">
                        Pending
                        {pendingCount > 0 && (
                            <Badge variant="secondary" className="ml-1">
                                {pendingCount}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>

                {["all", "pending", "approved", "rejected"].map((tab) => (
                    <TabsContent key={tab} value={tab} className="mt-0">
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <Card key={i}>
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
                                ))}
                            </div>
                        ) : (
                            <ScrollArea className="h-[calc(100vh-450px)]">
                                <div className="space-y-4">
                                    {filteredTickets
                                        .filter((ticket) => tab === "all" || ticket.status === tab.toUpperCase())
                                        .map((ticket) => (
                                            <Card key={ticket._id} className="overflow-hidden">
                                                <CardContent className="p-6">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <Ticket className="h-5 w-5 text-muted-foreground" />
                                                                <h3 className="font-medium text-lg">
                                                                    Grade Upgrade Request - {ticket.userId?.username || "Unknown User"}
                                                                </h3>
                                                                {getStatusBadge(ticket.status)}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">
                                                                From <span className="font-medium">{ticket.currentGrade?.name || "Unknown Grade"}</span>{" "}
                                                                to <span className="font-medium">{ticket.targetGrade?.name || "Unknown Grade"}</span>
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">Created: {formatDate(ticket.createdAt)}</p>
                                                            {ticket.processedAt && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    Processed: {formatDate(ticket.processedAt)}
                                                                    {ticket.processedBy?.username ? ` by ${ticket.processedBy.username}` : ""}
                                                                </p>
                                                            )}
                                                            {ticket.reason && (
                                                                <div className="flex items-start mt-2 p-2 bg-red-50 border border-red-100 rounded-md">
                                                                    <AlertCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                                                                    <p className="text-sm text-red-600">Reason: {ticket.reason}</p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                onClick={() => openDetailsDialog(ticket)}
                                                                className="bg-cyan-600 hover:bg-cyan-700 whitespace-nowrap"
                                                            >
                                                                View Details
                                                            </Button>

                                                            {ticket.status === "PENDING" && (
                                                                <>
                                                                    <Button
                                                                        variant="default"
                                                                        size="sm"
                                                                        onClick={() => handleTicket(ticket._id, "APPROVED")}
                                                                        className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
                                                                    >
                                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                                        Approve
                                                                    </Button>
                                                                    <Button
                                                                        variant="default"
                                                                        size="sm"
                                                                        onClick={() => openRejectDialog(ticket)}
                                                                        className="bg-red-600 hover:bg-red-700 whitespace-nowrap"
                                                                    >
                                                                        <XCircle className="h-4 w-4 mr-2" />
                                                                        Reject
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}

                                    {filteredTickets.filter((ticket) => tab === "all" || ticket.status === tab.toUpperCase()).length ===
                                        0 && <NoData message={`No ${tab !== "all" ? tab : ""} tickets found`} />}
                                </div>
                            </ScrollArea>
                        )}
                    </TabsContent>
                ))}
            </Tabs>

            {/* Reject Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Ticket</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this grade upgrade request. This will be visible to the user.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <h4 className="font-medium">Request Details</h4>
                            <p className="text-sm">
                                User: <span className="font-medium">{selectedTicket?.userId?.username}</span>
                            </p>
                            <p className="text-sm">
                                From {selectedTicket?.currentGrade?.name} to {selectedTicket?.targetGrade?.name}
                            </p>
                        </div>
                        <Textarea
                            placeholder="Enter rejection reason..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleReject}>
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Details Dialog */}
            <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Ticket Details</DialogTitle>
                        <DialogDescription>Complete information about this grade upgrade request.</DialogDescription>
                    </DialogHeader>
                    {selectedTicket && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-medium">Status</h3>
                                {getStatusBadge(selectedTicket.status)}
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-medium">User Information</h3>
                                <div className="bg-muted p-3 rounded-md">
                                    <p className="text-sm">
                                        Username: <span className="font-medium">{selectedTicket.userId?.username || "Unknown"}</span>
                                    </p>
                                    <p className="text-sm">
                                        User ID: <span className="font-mono text-xs">{selectedTicket.userId?._id || "Unknown"}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-medium">Grade Information</h3>
                                <div className="bg-muted p-3 rounded-md">
                                    <p className="text-sm">
                                        Current Grade: <span className="font-medium">{selectedTicket.currentGrade?.name || "Unknown"}</span>
                                    </p>
                                    <p className="text-sm">
                                        Target Grade: <span className="font-medium">{selectedTicket.targetGrade?.name || "Unknown"}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-medium">Timestamps</h3>
                                <div className="bg-muted p-3 rounded-md space-y-1">
                                    <p className="text-sm">
                                        Created: <span className="font-medium">{formatDate(selectedTicket.createdAt)}</span>
                                    </p>
                                    {selectedTicket.processedAt && (
                                        <p className="text-sm">
                                            Processed: <span className="font-medium">{formatDate(selectedTicket.processedAt)}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {selectedTicket.processedBy && (
                                <div className="space-y-2">
                                    <h3 className="font-medium">Processed By</h3>
                                    <div className="bg-muted p-3 rounded-md">
                                        <p className="text-sm">
                                            Admin: <span className="font-medium">{selectedTicket.processedBy.username}</span>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {selectedTicket.reason && (
                                <div className="space-y-2">
                                    <h3 className="font-medium">Rejection Reason</h3>
                                    <div className="bg-red-50 border border-red-100 p-3 rounded-md">
                                        <p className="text-sm text-red-600">{selectedTicket.reason}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
