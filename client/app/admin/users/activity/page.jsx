"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/contexts/UserContext"
import { useToastAlert } from "@/contexts/ToastContext"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
    Shield,
    Loader2,
    RefreshCw,
    Clock,
    Users,
    Activity,
    CheckCircle,
    XCircle,
    Calendar
} from "lucide-react"
import { format } from "date-fns"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

const containerAnimation = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 30,
        },
    },
}

export default function UserActivityPage() {
    const router = useRouter()
    const { user } = useUser()
    const { toastError } = useToastAlert()
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [usersSummary, setUsersSummary] = useState([])
    const [dateRange, setDateRange] = useState({
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        to: new Date()
    })

    const fetchUserActivity = async () => {
        try {
            const params = new URLSearchParams()
            if (dateRange.from) params.append('startDate', dateRange.from.toISOString())
            if (dateRange.to) params.append('endDate', dateRange.to.toISOString())

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/users/activity/summary?${params.toString()}`,
                { credentials: "include" }
            )

            if (!response.ok) {
                throw new Error('Failed to fetch user activity')
            }

            const data = await response.json()
            setUsersSummary(data)
        } catch (error) {
            console.error(error)
            toastError("Failed to fetch user activity")
        }
    }

    const refreshActivity = async () => {
        setRefreshing(true)
        await fetchUserActivity()
        setRefreshing(false)
    }

    useEffect(() => {
        if (user === false) {
            router.replace('/login')
            return
        }
        if (user && !user.admin) {
            router.replace('/')
            return
        }
        if (user?.admin) {
            fetchUserActivity().finally(() => setIsLoading(false))
        }
    }, [user, router, dateRange])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (user === false || !user?.admin) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] p-4">
                <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                <p className="text-muted-foreground text-center">
                    {user === false 
                        ? "Please log in to access this page."
                        : "You don't have permission to access this page."}
                </p>
            </div>
        )
    }

    const activeUsers = usersSummary.filter(u => u.activity.totalRequests > 0)
    const avgSuccessRate = activeUsers.length > 0
        ? (activeUsers.reduce((acc, u) => acc + parseFloat(u.activity.successRate), 0) / activeUsers.length).toFixed(1)
        : 0
    const totalRequests = usersSummary.reduce((acc, u) => acc + u.activity.totalRequests, 0)

    return (
        <div className="p-4 space-y-6 h-full">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerAnimation}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold">User Activity Dashboard</h1>
                    <p className="text-muted-foreground">Monitor user connections and activity</p>
                </div>
                <div className="flex items-center gap-4">
                    <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                    <Button onClick={refreshActivity} variant="outline" disabled={refreshing}>
                        {refreshing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                        Refresh
                    </Button>
                </div>
            </motion.div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerAnimation}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                <motion.div variants={itemAnimation}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{usersSummary.length}</div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemAnimation}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                            <Activity className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activeUsers.length}</div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemAnimation}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Success Rate</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{avgSuccessRate}%</div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemAnimation}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                            <Activity className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalRequests}</div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            <Card>
                <CardHeader>
                    <CardTitle>User Activity</CardTitle>
                    <CardDescription>Overview of user activity and connections</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Last Active</TableHead>
                                    <TableHead>Total Requests</TableHead>
                                    <TableHead>Success Rate</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {usersSummary.map((user) => (
                                    <TableRow 
                                        key={user._id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.push(`/admin/users/${user._id}/activity`)}
                                    >
                                        <TableCell className="font-medium">{user.username}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            {user.activity.lastActive
                                                ? format(new Date(user.activity.lastActive), 'MMM d, yyyy HH:mm')
                                                : 'Never'}
                                        </TableCell>
                                        <TableCell>{user.activity.totalRequests}</TableCell>
                                        <TableCell>{user.activity.successRate}%</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                user.activity.lastActive 
                                                    ? 'bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-400 ring-1 ring-green-600/20'
                                                    : 'bg-gray-50 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400 ring-1 ring-gray-500/20'
                                            }`}>
                                                {user.activity.lastActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
