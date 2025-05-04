"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
    ResponsiveContainer,
    Brush,
    ReferenceLine,
    AreaChart,
    Area,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import Loading from "@/components/loading"
import Alert from "@/components/alert"
import { addDays, format, subDays } from "date-fns"
import { fr } from "date-fns/locale"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Calendar, Download, Gauge, Info, Maximize2, RefreshCw } from "lucide-react"

/* ────── constantes ────── */
const COLORS = ["#0ea5e9", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6", "#f97316"]
const COLORS_AREA = COLORS.map(color => `${color}40`)
const STEP_SEC = 10 // 1 point / 10 s
const DAY_POINTS = 86_400 / STEP_SEC // 8 640

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null

    return (
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
            <p className="font-medium text-gray-700 mb-2">{`Time: ${label}`}</p>
            {payload.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                    <p className="text-gray-600">
                        {`${entry.name}: `}
                        <span className="font-semibold">{entry.value}</span>
                    </p>
                </div>
            ))}
        </div>
    )
}

export default function SensorGraphPage() {
    const { id: machineId, sensorId } = useParams()
    const router = useRouter()

    const [machine, setMachine] = useState(null)
    const [sensors, setSensors] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [chartView, setChartView] = useState("line")
    const [fullscreen, setFullscreen] = useState(false)

    const [chartData, setChartData] = useState([])
    const [userColors, setUserColors] = useState({})
    const [view, setView] = useState({ start: 0, end: DAY_POINTS - 1 })
    const [stats, setStats] = useState({ min: 0, max: 0, avg: 0 })

    const fetchData = async () => {
        setIsRefreshing(true)
        try {
            const [mRes, sRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machines/${machineId}`, {
                    credentials: "include"
                }),
                fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sensors`)
            ])
            if (!mRes.ok) throw new Error("Machine not found")
            const [mData, sData] = await Promise.all([mRes.json(), sRes.json()])
            setMachine(mData)
            setSensors(sData)
        } catch (e) {
            setError(e.message)
        } finally {
            setLoading(false)
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [machineId])

    useEffect(() => {
        if (!machine || sensors.length === 0) return

        const sensor = sensors.find((s) => s._id.toString() === sensorId)
        if (!sensor) {
            setError("Sensor not found")
            return
        }

        const dayStartUTC = Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), selectedDate.getUTCDate())

        const dayRec = machine.usageStats?.find((d) => new Date(d.day).getTime() === dayStartUTC)
        if (!dayRec || !dayRec.sensorData) {
            setChartData([])
            return
        }

        const allKeys = Array.from(
            dayRec.sensorData.keys
                ? dayRec.sensorData.keys()
                : Object.keys(dayRec.sensorData)
        )
        const wanted = sensor.designation
        const designation = allKeys.includes(wanted) ? wanted : allKeys[0]

        const readingsByUser = {}
        const rawArray = dayRec.sensorData instanceof Map ? dayRec.sensorData.get(designation) : dayRec.sensorData[designation]

        rawArray.forEach(({ timestamp, value, user }) => {
            const t = new Date(timestamp)
            const alignedSec = Math.floor(t.getUTCSeconds() / STEP_SEC) * STEP_SEC
            const bucketUTC = Date.UTC(
                t.getUTCFullYear(),
                t.getUTCMonth(),
                t.getUTCDate(),
                t.getUTCHours(),
                t.getUTCMinutes(),
                alignedSec
            )
            const label = new Date(bucketUTC).toISOString().slice(11, 19)
            const uid = typeof user === "string" ? user : (user?.username ?? user?.name ?? user?._id ?? "unknown")
            ;(readingsByUser[uid] ??= new Map()).set(label, value)
        })

        const dayStartDate = new Date(dayStartUTC)
        const labels = Array.from({ length: DAY_POINTS }, (_, i) =>
            new Date(dayStartDate.getTime() + i * STEP_SEC * 1e3).toISOString().slice(11, 19)
        )

        const dataset = labels.map((time) => {
            const row = { time }
            for (const u of Object.keys(readingsByUser)) {
                const rawValue = readingsByUser[u].get(time)
                if (rawValue) {
                    const value = parseFloat(rawValue)
                    if (!isNaN(value)) {
                        row[u] = value
                    }
                }
            }
            return row
        })

        const filteredDataset = dataset.filter(row => {
            const hasValidValue = Object.entries(row)
                .filter(([key]) => key !== 'time')
                .some(([_, value]) => {
                    const parsed = parseFloat(value)
                    return !isNaN(parsed) && parsed !== 0
                })
            return hasValidValue
        })

        const palette = {}
        Object.keys(readingsByUser).forEach((u, i) => (palette[u] = COLORS[i % COLORS.length]))

        setChartData(filteredDataset)
        setUserColors(palette)

        if (filteredDataset.length > 0) {
            setView({ start: 0, end: filteredDataset.length - 1 })

            const allValues = filteredDataset.flatMap((d) =>
                Object.entries(d)
                    .filter(([k]) => k !== "time")
                    .map(([_, v]) => v)
                    .filter((v) => v !== 0)
            )

            if (allValues.length > 0) {
                const min = Math.min(...allValues)
                const max = Math.max(...allValues)
                const avg = allValues.reduce((sum, val) => sum + val, 0) / allValues.length

                setStats({
                    min: Math.round(min * 100) / 100,
                    max: Math.round(max * 100) / 100,
                    avg: Math.round(avg * 100) / 100,
                })
            }
        }
    }, [machine, sensors, sensorId, selectedDate])

    const handleWheel = (e) => {
        if (!chartData.length) return
        e.preventDefault()

        const span = view.end - view.start
        const step = Math.max(1, Math.round(span * 0.1))
        const dir = e.deltaY < 0 ? 1 : -1

        let start = view.start + dir * step
        let end = view.end - dir * step

        start = Math.max(0, start)
        end = Math.min(chartData.length - 1, end)
        if (end - start < 10) return

        setView({ start, end })
    }

    const changeDate = (d) => setSelectedDate((prev) => addDays(prev, d))

    const exportData = (format) => {
        if (!chartData.length) return

        if (format === "csv") {
            const headers = ["time", ...Object.keys(chartData[0]).filter((k) => k !== "time")]
            const csvContent = [headers.join(","), ...chartData.map((row) => headers.map((h) => row[h]).join(","))].join("\n")

            const blob = new Blob([csvContent], { type: "text/csv" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `sensor-data-${selectedDate.toISOString().split('T')[0]}.csv`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
        }
    }

    if (loading) return <Loading />
    if (error) return <Alert type="error" message={error} onClose={() => router.push(`/machines/${machineId}`)} />

    const sensor = sensors.find((s) => s._id.toString() === sensorId)

    return (
        <motion.div
            className={`container mx-auto px-4 py-6 ${fullscreen ? "fixed inset-0 z-50 bg-white" : ""}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/machines/${machineId}`)}
                            className="h-8 w-8"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-2xl font-bold">{sensor?.designation}</h1>
                    </div>
                    <p className="text-gray-500 ml-10">Machine: {machine?.name}</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => fetchData()}
                        disabled={isRefreshing}
                        className="flex items-center gap-1"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </Button>

                    <Select onValueChange={exportData}>
                        <SelectTrigger className="w-[120px] h-9">
                            <div className="flex items-center gap-1">
                                <Download className="h-3.5 w-3.5" />
                                <span>Export</span>
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="csv">CSV</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardHeader className="pt-4 pb-0">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <div className="h-4 w-4 rounded-full bg-blue-500"></div>
                            Minimal value
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="py-4">
                        <p className="text-2xl font-bold">{stats.min}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pt-4 pb-0">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <div className="h-4 w-4 rounded-full bg-purple-500"></div>
                            Mean value
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="py-4">
                        <p className="text-2xl font-bold">{stats.avg}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pt-4 pb-0">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <div className="h-4 w-4 rounded-full bg-green-500"></div>
                            Maximal value
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="py-4">
                        <p className="text-2xl font-bold">{stats.max}</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="mb-6">
                <CardHeader className="pb-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Gauge className="h-6 w-6 text-primary-foreground" />
                            <CardTitle>Sensor data</CardTitle>
                        </div>

                        <div className="flex items-center justify-center gap-2">
                            <Button variant="secondary" size="icon" onClick={() => changeDate(-1)} className="h-8 w-8">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-secondary">
                                <Calendar className="h-4 w-4 text-primary-foreground" />
                                <span className="font-medium">{format(selectedDate, "d MMMM yyyy", { locale: fr })}</span>
                            </div>
                            <Button variant="secondary" size="icon" onClick={() => changeDate(1)} className="h-8 w-8">
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-6">
                    <Tabs defaultValue="line" onValueChange={setChartView} className="mb-4">
                        <TabsList className="grid w-full max-w-xs grid-cols-2">
                            <TabsTrigger value="line">Line</TabsTrigger>
                            <TabsTrigger value="area">Area</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {chartData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Info className="h-12 w-12 text-gray-300 mb-4" />
                            <p className="text-gray-500 font-medium">No data available for this date</p>
                            <p className="text-gray-400 text-sm mt-1">Try another date</p>
                            <div className="flex gap-2 mt-6">
                                <Button variant="secondary" size="sm" onClick={() => setSelectedDate(subDays(new Date(), 1))}>
                                    Yesterday
                                </Button>
                                <Button variant="secondary" size="sm" onClick={() => setSelectedDate(new Date())}>
                                    Today
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-lg border p-4 bg-white shadow-inner">
                            <ResponsiveContainer width="100%" height={460} className="mt-4">
                                {chartView === "line" ? (
                                    <LineChart
                                        data={chartData.slice(view.start, view.end + 1)}
                                        onWheel={handleWheel}
                                        margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="time"
                                            interval="preserveStartEnd"
                                            tick={{ fontSize: 12 }}
                                            stroke="#9ca3af"
                                            minTickGap={50}
                                        />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#9ca3af" />

                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend formatter={(value) => <span className="text-sm font-medium">User {value}</span>} />
                                        <Brush dataKey="time" />

                                        <ReferenceLine
                                            y={stats.avg}
                                            stroke="#8b5cf6"
                                            strokeDasharray="3 3"
                                            label={{
                                                value: "Average",
                                                position: "insideBottomRight",
                                                fill: "#8b5cf6",
                                                fontSize: 12,
                                            }}
                                        />

                                        <ReferenceLine
                                            y={stats.min}
                                            stroke="#ef4444"
                                            strokeDasharray="3 3"
                                            label={{
                                                value: "Min",
                                                position: "insideBottomRight",
                                                fill: "#ef4444",
                                                fontSize: 12,
                                            }}
                                        />

                                        <ReferenceLine
                                            y={stats.max}
                                            stroke="#10b981"
                                            strokeDasharray="3 3"
                                            label={{
                                                value: "Max",
                                                position: "insideBottomRight",
                                                fill: "#10b981",
                                                fontSize: 12,
                                            }}
                                        />

                                        {Object.keys(chartData[0])
                                            .filter((k) => k !== "time")
                                            .map((u) => (
                                                <Line
                                                    key={u}
                                                    dataKey={u}
                                                    type="basis"
                                                    name={u}
                                                    stroke={userColors[u]}
                                                    strokeWidth={2}
                                                    dot={false}
                                                    activeDot={{ r: 6, strokeWidth: 2 }}
                                                    connectNulls={true}
                                                    isAnimationActive={true}
                                                    animationDuration={500}
                                                />
                                            ))}

                                        <Brush
                                            dataKey="time"
                                            height={30}
                                            stroke="#8884d8"
                                            fill="#f3f4f6"
                                            travellerWidth={10}
                                            startIndex={view.start}
                                            endIndex={view.end}
                                            onChange={({ startIndex, endIndex }) => setView({ start: startIndex, end: endIndex })}
                                        />
                                    </LineChart>
                                ) : (
                                    <AreaChart
                                        data={chartData.slice(view.start, view.end + 1)}
                                        onWheel={handleWheel}
                                        margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="time"
                                            interval="preserveStartEnd"
                                            tick={{ fontSize: 12 }}
                                            stroke="#9ca3af"
                                            minTickGap={50}
                                        />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#9ca3af" />

                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend formatter={(value) => <span className="text-sm font-medium">User {value}</span>} />

                                        <Brush dataKey="time" />

                                        <ReferenceLine
                                            y={stats.avg}
                                            stroke="#8b5cf6"
                                            strokeDasharray="3 3"
                                            label={{
                                                value: "Average",
                                                position: "insideBottomRight",
                                                fill: "#8b5cf6",
                                                fontSize: 12,
                                            }}
                                        />

                                        <ReferenceLine
                                            y={stats.min}
                                            stroke="#ef4444"
                                            strokeDasharray="3 3"
                                            label={{
                                                value: "Min",
                                                position: "insideBottomRight",
                                                fill: "#ef4444",
                                                fontSize: 12,
                                            }}
                                        />

                                        <ReferenceLine
                                            y={stats.max}
                                            stroke="#10b981"
                                            strokeDasharray="3 3"
                                            label={{
                                                value: "Max",
                                                position: "insideBottomRight",
                                                fill: "#10b981",
                                                fontSize: 12,
                                            }}
                                        />

                                        {Object.keys(chartData[0])
                                            .filter((k) => k !== "time")
                                            .map((u, i) => (
                                                <Area
                                                    key={u}
                                                    dataKey={u}
                                                    type="basis"
                                                    name={u}
                                                    stroke={userColors[u]}
                                                    fill={COLORS_AREA[i % COLORS_AREA.length]}
                                                    strokeWidth={2}
                                                    dot={false}
                                                    activeDot={{ r: 6, strokeWidth: 2 }}
                                                    connectNulls={true}
                                                    isAnimationActive={true}
                                                    animationDuration={500}
                                                />
                                            ))}

                                        <Brush
                                            dataKey="time"
                                            height={30}
                                            stroke="#8884d8"
                                            fill="#f3f4f6"
                                            travellerWidth={10}
                                            startIndex={view.start}
                                            endIndex={view.end}
                                            onChange={({ startIndex, endIndex }) => setView({ start: startIndex, end: endIndex })}
                                        />
                                    </AreaChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}
