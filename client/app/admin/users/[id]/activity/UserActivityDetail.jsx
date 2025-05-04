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
    ArrowLeft,
    Activity,
    CheckCircle,
    Calendar,
    XCircle
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

export default function UserActivityDetail({ userId }) {
    const router = useRouter()
    const { user } = useUser()
    const { toastError } = useToastAlert()
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [userData, setUserData] = useState(null)
    const [dateRange, setDateRange] = useState({
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        to: new Date()
    })

    const fetchUserActivity = async () => {
        if (!userId) {
            console.error('No user ID provided');
            return;
        }

        try {
            const queryParams = new URLSearchParams()
            if (dateRange.from) queryParams.append('startDate', dateRange.from.toISOString())
            if (dateRange.to) queryParams.append('endDate', dateRange.to.toISOString())

            console.log(`Fetching activity for user ID: ${userId}`);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/users/${userId}/activity?${queryParams}`,
                { 
                    credentials: "include",
                    headers: {
                        'Accept': 'application/json'
                    }
                }
            )

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                throw new Error(errorData.message || 'Failed to fetch user activity')
            }

            const data = await response.json()
            console.log('Fetched user activity:', data);
            setUserData(data)
        } catch (error) {
            console.error('Error fetching user activity:', error)
            toastError(error.message || "Failed to fetch user activity")
        }
    }

    const refreshActivity = async () => {
        try {
            setRefreshing(true)
            await fetchUserActivity()
        } catch (error) {
            console.error('Error refreshing activity:', error)
            toastError(error.message || "Failed to refresh activity")
        } finally {
            setRefreshing(false)
        }
    }

    // Initial load effect
    useEffect(() => {
        if (user === false) {
            router.replace('/login')
            return
        }
        if (user && !user.admin) {
            router.replace('/')
            return
        }
        if (user?.admin && userId) {
            console.log('Initial fetch for user ID:', userId);
            setIsLoading(true)
            fetchUserActivity().finally(() => setIsLoading(false))
        }
    }, [user, router, userId])

    // Date range change effect
    useEffect(() => {
        if (user?.admin && userId && !isLoading) {
            console.log('Fetching data for date range:', dateRange);
            fetchUserActivity()
        }
    }, [dateRange])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (user === false || !user?.admin || !userData) {
        const reason = !userData ? 'No data available' : user === false ? 'Not logged in' : 'Not admin';
        console.log('Access denied:', reason);
        
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] p-4">
                <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                <p className="text-muted-foreground text-center">
                    {user === false 
                        ? "Please log in to access this page."
                        : !userData
                        ? "Could not load user activity data."
                        : "You don't have permission to access this page."}
                </p>
            </div>
        )
    }

    console.log('Rendering with user data:', userData);

    const formattedLoginHistory = (userData.activity?.loginHistory || []).map(login => ({
        ...login,
        formattedDate: format(new Date(login.date), 'MMM d, yyyy HH:mm')
    }))

    return (
        <div className="p-4 space-y-6 h-full">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerAnimation}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div className="flex items-center gap-4">
                    <Button 
                        variant="ghost" 
                        onClick={() => router.push('/admin/users/activity')}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{userData.user?.name || 'User'}</h1>
                        <p className="text-muted-foreground">{userData.user?.email || ''}</p>
                    </div>
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
                            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{userData.activity?.totalRequests || 0}</div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemAnimation}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{userData.activity?.successRate || 0}%</div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemAnimation}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                            <Clock className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {(userData.activity?.avgResponseTime || 0).toFixed(2)} ms
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemAnimation}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Error Count</CardTitle>
                            <XCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{userData.activity?.errorCount || 0}</div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="h-[500px] flex flex-col">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Last {userData.activity?.topPaths?.length || 0} requests</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden">
                        <div className="rounded-md border h-full overflow-auto">
                            <Table>
                                <TableHeader className="sticky top-0 bg-background z-10">
                                    <TableRow>
                                        <TableHead>Endpoint</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(userData.activity?.topPaths || []).map((path, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-mono text-xs">{path.path}</TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                    path.method === 'GET' 
                                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 ring-1 ring-blue-600/20'
                                                        : path.method === 'POST'
                                                        ? 'bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-400 ring-1 ring-green-600/20'
                                                        : 'bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 ring-1 ring-amber-600/20'
                                                }`}>
                                                    {path.method}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                    path.statusCode < 400 
                                                        ? 'bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-400 ring-1 ring-green-600/20'
                                                        : 'bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400 ring-1 ring-red-600/20'
                                                }`}>
                                                    {path.statusCode}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {format(new Date(path.timestamp), 'HH:mm:ss')}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-[500px] flex flex-col">
                    <CardHeader className="flex-none">
                        <CardTitle>Login History</CardTitle>
                        <CardDescription>Recent successful logins</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden">
                        <div className="rounded-md border h-full overflow-auto">
                            <Table>
                                <TableHeader className="sticky top-0 bg-background z-10">
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Count</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {formattedLoginHistory.map((login, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{login.formattedDate}</TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 ring-1 ring-blue-600/20">
                                                    {login.count} time{login.count > 1 ? 's' : ''}
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
        </div>
    )
}
