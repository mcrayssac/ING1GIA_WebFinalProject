"use client"

import { useEffect, useState, useCallback } from "react"
import { useUser } from "@/contexts/UserContext"
import { useToastAlert } from "@/contexts/ToastContext"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
    BarChart as BarChartIcon,
    Shield,
    Loader2,
    RefreshCw,
    Clock,
    Gauge,
    Activity,
    CheckCircle,
    XCircle,
    Filter,
    Calendar
} from "lucide-react"
import { format } from "date-fns"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MultiSelect } from "@/components/ui/multi-select"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import NoData from "@/components/no-data"

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

const intervals = [
    { value: "hour", label: "Hourly" },
    { value: "day", label: "Daily" },
    { value: "week", label: "Weekly" },
]

export default function MetricsPage() {
    const router = useRouter()
    const { user } = useUser()
    const { toastError } = useToastAlert()
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [metrics, setMetrics] = useState(null)
    const [timeseries, setTimeseries] = useState([])
    const [filters, setFilters] = useState({
        methods: [],
        statuses: [],
        paths: [],
        origins: [],
    })
    const [selectedFilters, setSelectedFilters] = useState({
        methods: [],
        statuses: [],
        paths: [],
        origins: [],
    })
    const [dateRange, setDateRange] = useState({
        from: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        to: new Date()
    })
    const [interval, setInterval] = useState("hour")

    const formatTimeLabel = useCallback((_id, interval) => {
        switch (interval) {
            case 'hour':
                return `${_id.year}-${_id.month}-${_id.day} ${_id.hour}:00`
            case 'day':
                return `${_id.year}-${_id.month}-${_id.day}`
            case 'week':
                return `${_id.year} W${_id.week}`
            default:
                return ''
        }
    }, [])

    const fetchMetrics = useCallback(async () => {
        try {
            // Build query parameters
            const params = new URLSearchParams()
            if (dateRange.from) params.append('startDate', dateRange.from.toISOString())
            if (dateRange.to) params.append('endDate', dateRange.to.toISOString())
            if (selectedFilters.methods.length) params.append('methods', selectedFilters.methods.map(m => m.value).join(','))
            if (selectedFilters.statuses.length) params.append('statuses', selectedFilters.statuses.map(s => s.value).join(','))
            if (selectedFilters.paths.length) params.append('paths', selectedFilters.paths.map(p => p.value).join(','))
            if (selectedFilters.origins.length) params.append('origins', selectedFilters.origins.map(o => o.value).join(','))

            const [metricsResponse, timeseriesResponse] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/metrics?${params.toString()}`, {
                    credentials: "include"
                }),
                fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/metrics/timeseries?${params.toString()}&interval=${interval}`, {
                    credentials: "include"
                })
            ])

            if (!metricsResponse.ok || !timeseriesResponse.ok) {
                throw new Error('Failed to fetch metrics')
            }

            const [metricsData, timeseriesData] = await Promise.all([
                metricsResponse.json(),
                timeseriesResponse.json()
            ])

            setMetrics(metricsData)
            setFilters({
                methods: metricsData.filters.methods.map(m => ({ value: m, label: m })),
                statuses: metricsData.filters.statuses.map(s => ({ value: s.toString(), label: s.toString() })),
                paths: metricsData.filters.paths.map(p => ({ value: p, label: p })),
                origins: metricsData.filters.origins.filter(Boolean).map(o => ({ value: o, label: o }))
            })
            
            // Format timeseries data for charts
            const formattedTimeseries = timeseriesData.map(point => ({
                ...point,
                timestamp: formatTimeLabel(point._id, interval),
                successRate: point.count > 0 ? (point.successCount / point.count * 100).toFixed(1) : 0
            }))
            setTimeseries(formattedTimeseries)
        } catch (error) {
            console.error(error)
            toastError("Failed to fetch metrics")
        }
    }, [dateRange, selectedFilters, interval, formatTimeLabel, toastError])

    const refreshMetrics = useCallback(async () => {
        setRefreshing(true)
        await fetchMetrics()
        setRefreshing(false)
    }, [fetchMetrics])

    // Authentication effect
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
            setIsLoading(true)
            fetchMetrics().finally(() => setIsLoading(false))
        }
    }, [user, router])

    // Data fetching effect
    useEffect(() => {
        if (user?.admin) {
            fetchMetrics()
        }
    }, [fetchMetrics, user, dateRange, selectedFilters, interval])

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

    return (
        <div className="p-4 space-y-6 h-full">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerAnimation}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold">Metrics Dashboard</h1>
                    <p className="text-muted-foreground">Monitor API requests and performance</p>
                </div>
                <Button onClick={refreshMetrics} variant="outline" disabled={refreshing}>
                    {refreshing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                    Refresh
                </Button>
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
                            <div className="text-2xl font-bold">{metrics?.stats?.totalRequests || 0}</div>
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
                            <div className="text-2xl font-bold">
                                {metrics?.stats?.totalRequests > 0 
                                    ? ((metrics.stats.successCount / metrics.stats.totalRequests) * 100).toFixed(1)
                                    : 0}%
                            </div>
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
                                {metrics?.stats?.avgResponseTime?.toFixed(2) || 0} ms
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemAnimation}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                            <XCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {metrics?.stats?.totalRequests > 0
                                    ? ((metrics.stats.errorCount / metrics.stats.totalRequests) * 100).toFixed(1)
                                    : 0}%
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            <motion.div variants={containerAnimation} className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                    
                    <Select value={interval} onValueChange={setInterval}>
                        <SelectTrigger className="w-[180px]">
                            <Calendar className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Select interval" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Time Interval</SelectLabel>
                                {intervals.map(({ value, label }) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {Object.entries(filters).map(([key, options]) => (
                        <MultiSelect
                            key={key}
                            options={options}
                            selected={selectedFilters[key]}
                            onChange={selected => setSelectedFilters(prev => ({ ...prev, [key]: selected }))}
                            placeholder={`Filter by ${key}`}
                        />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Request Volume</CardTitle>
                            <CardDescription>Number of requests over time</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={timeseries}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="timestamp" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#3b82f6" name="Requests" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Response Time & Success Rate</CardTitle>
                            <CardDescription>Average response time and success rate over time</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={timeseries}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="timestamp" />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <Tooltip />
                                    <Line 
                                        yAxisId="left"
                                        type="monotone" 
                                        dataKey="avgResponseTime" 
                                        stroke="#3b82f6" 
                                        name="Response Time (ms)"
                                    />
                                    <Line 
                                        yAxisId="right"
                                        type="monotone" 
                                        dataKey="successRate" 
                                        stroke="#22c55e" 
                                        name="Success Rate (%)"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </div>
    )
}
