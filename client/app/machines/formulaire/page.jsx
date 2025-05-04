"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/contexts/UserContext"
import { useToastAlert } from "@/contexts/ToastContext"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
import { motion, AnimatePresence } from "framer-motion"
import {
    Loader2,
    PlusCircle,
    Database,
    Tag,
    PenToolIcon as Tool,
    Users,
    Award,
    Activity,
    ListFilter,
    BuildingIcon as Buildings,
    Zap,
    AlertCircle,
} from "lucide-react"

export default function AddMachinePage() {
    const { user } = useUser()
    const router = useRouter()
    const { toastError, toastSuccess } = useToastAlert()
    const [machine, setMachine] = useState({
        name: "",
        mainPole: "",
        subPole: "",
        pointsPerCycle: "",
        maxUsers: "",
        requiredGrade: "",
        status: "available",
        site: null,
        availableSensors: [],
    })
    const [sites, setSites] = useState([])
    const [sensors, setSensors] = useState([])
    const [grades, setGrades] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)
    const [formTouched, setFormTouched] = useState(false)
    const [formProgress, setFormProgress] = useState(0)
    const [validationErrors, setValidationErrors] = useState({})
    
    // Calculate form completion progress
    useEffect(() => {
        const requiredFields = [
            machine.name,
            machine.mainPole,
            machine.subPole,
            machine.pointsPerCycle,
            machine.maxUsers,
            machine.requiredGrade,
            machine.site,
            machine.availableSensors.length > 0
        ]

        const filledFields = requiredFields.filter(Boolean).length
        const progress = Math.round((filledFields / requiredFields.length) * 100)
        setFormProgress(progress)
    }, [machine])

    // Field validation
    useEffect(() => {
        const errors = {}
        
        if (machine.name && machine.name.trim().length < 3) {
            errors.name = "Name must be at least 3 characters"
        }
        
        if (machine.pointsPerCycle && (isNaN(machine.pointsPerCycle) || Number(machine.pointsPerCycle) < 0)) {
            errors.pointsPerCycle = "Points must be a positive number"
        }
        
        if (machine.maxUsers && (isNaN(machine.maxUsers) || Number(machine.maxUsers) < 1)) {
            errors.maxUsers = "Max users must be at least 1"
        }
        
        if (!machine.site) {
            errors.site = "Site selection is required"
        }

        if (!machine.availableSensors.length) {
            errors.sensors = "At least one sensor must be selected"
        }
        
        setValidationErrors(errors)
    }, [machine])

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all data in parallel
                const [sitesRes, sensorsRes, gradesRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sites`, {
                        credentials: "include",
                    }),
                    fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sensors`, {
                        credentials: "include",
                    }),
                    fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/grades`, {
                        credentials: "include",
                    }),
                ])

                // Check for errors
                if (!sitesRes.ok) throw new Error("Failed to fetch sites")
                if (!sensorsRes.ok) throw new Error("Failed to fetch sensors")
                if (!gradesRes.ok) throw new Error("Failed to fetch grades")

                // Parse all responses
                const [sitesData, sensorsData, gradesData] = await Promise.all([
                    sitesRes.json(),
                    sensorsRes.json(),
                    gradesRes.json(),
                ])

                setSites(sitesData)
                setSensors(sensorsData)
                setGrades(gradesData)
            } catch (err) {
                console.error("Error fetching data:", err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    // Check user authorization
    useEffect(() => {
        if (user === false) {
            router.replace("/login")
            return
        }
        if (user && !(user.admin || ['Engineer', 'Manager'].includes(user?.grade?.name))) {
            router.replace("/machines")
            return
        }
    }, [user, router])

    const handleChange = (e) => {
        const { name, value } = e.target
        setMachine((prev) => ({ ...prev, [name]: value }))
        setFormTouched(true)
    }

    const handleSelectChange = (name, value) => {
        setMachine((prev) => ({ ...prev, [name]: value }))
        setFormTouched(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        // Check for validation errors
        if (Object.keys(validationErrors).length > 0) {
            toastError("Please fix form errors before submitting")
            return
        }
        
        if (!machine.site) {
            toastError("Please select a site for the machine")
            return
        }

        if (!machine.availableSensors.length) {
            toastError("Please select at least one sensor")
            return
        }
        
        setSubmitting(true)
        setError(null)

        try {
            const machineData = {
                name: machine.name,
                mainPole: machine.mainPole,
                subPole: machine.subPole,
                pointsPerCycle: Number(machine.pointsPerCycle),
                maxUsers: Number(machine.maxUsers),
                requiredGrade: machine.requiredGrade,
                status: machine.status,
                availableSensors: machine.availableSensors,
                site: machine.site,
            }

        if (user.admin) {
            // Direct creation for admin users only
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machines`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(machineData),
                    credentials: "include",
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || "Failed to add machine")
                }

                toastSuccess("Machine added successfully!")
            } else if (['Engineer', 'Manager'].includes(user?.grade?.name)) {
                // Create a creation request ticket for engineers/managers
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/tickets`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        type: "MACHINE_CREATION",
                        machineData
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to create machine request");
                }

                toastSuccess("Machine creation request submitted for admin approval");
            } else {
                toastError("You do not have permission to add machines")
                return
            }

            // Reset form
            setMachine({
                name: "",
                mainPole: "",
                subPole: "",
                pointsPerCycle: "",
                maxUsers: "",
                requiredGrade: "",
                status: "available",
                site: null,
                availableSensors: [],
            })

            setFormTouched(false)
            router.push("/machines")
        } catch (err) {
            console.error("Error adding machine:", err)
            setError(err.message)
            toastError(err.message || "Failed to add machine")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <motion.div 
                className="container mx-auto px-4 py-8 max-w-4xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="h-10 bg-muted/60 rounded-md w-1/3 mx-auto mb-6 animate-pulse"></div>
                <motion.div 
                    className="bg-background shadow-md rounded-lg p-6 border"
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    transition={{ type: "spring", stiffness: 100 }}
                >
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <motion.div 
                                    key={i} 
                                    className="space-y-2"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <div className="h-5 bg-muted/60 rounded w-1/3 animate-pulse"></div>
                                    <div className="h-10 bg-muted/60 rounded-md animate-pulse"></div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <div className="h-5 bg-muted/60 rounded w-1/4 animate-pulse"></div>
                            <div className="h-10 bg-muted/60 rounded-md animate-pulse"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-5 bg-muted/60 rounded w-1/4 animate-pulse"></div>
                            <div className="h-10 bg-muted/60 rounded-md animate-pulse"></div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <div className="h-10 bg-muted/60 rounded-md w-32 animate-pulse"></div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )
    }

    if (user === undefined) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 20 } },
    }

    const sectionVariants = {
        hidden: { opacity: 0, height: 0 },
        visible: { 
            opacity: 1, 
            height: "auto", 
            transition: { 
                duration: 0.4, 
                ease: "easeInOut"
            } 
        }
    }

    const progressVariants = {
        initial: { width: 0 },
        animate: { width: `${formProgress}%`, transition: { duration: 0.5 } },
    }

    return (
        <motion.div
            className="container mx-auto px-4 py-8 max-w-4xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                className="flex items-center justify-center mb-6"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                <div className="flex flex-col items-center gap-2">
                    <h1 className="text-3xl font-bold text-center inline-flex items-center gap-2">
                        <PlusCircle className="h-8 w-8 text-primary" />
                        <span>Add New Machine</span>
                    </h1>
                    {['Engineer', 'Manager'].includes(user?.grade?.name) && (
                        <p className="text-sm text-muted-foreground text-center">
                            As an {user?.grade?.name}, your machine creation request will need admin approval.
                        </p>
                    )}
                </div>
            </motion.div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 flex items-center"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Activity className="h-5 w-5 mr-2 text-red-500" />
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                className="bg-card text-card-foreground shadow-md rounded-lg overflow-hidden border"
                variants={container}
                initial="hidden"
                animate="show"
            >
                {/* Form progress */}
                <div className="w-full h-2 bg-muted/40 relative">
                    <motion.div
                        className="absolute top-0 left-0 h-full bg-secondary"
                        variants={progressVariants}
                        initial="initial"
                        animate="animate"
                    />
                </div>

                <AnimatePresence>
                    {formTouched && (
                        <motion.div 
                            className="bg-amber-50 px-4 py-2 text-sm text-amber-700 flex items-center border-b"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Activity className="h-4 w-4 mr-2" />
                            You have unsaved changes
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* General Information */}
                    <motion.section variants={item} className="space-y-4">
                        <motion.div 
                            className="flex items-center gap-2 text-xl font-semibold pb-2 border-b text-primary-foreground"
                            whileHover={{ scale: 1.01 }}
                        >
                            <Database className="h-5 w-5 text-primary-foreground" />
                            General Information
                        </motion.div>
                        <motion.div 
                            variants={sectionVariants}
                            initial="visible"
                            animate="visible"
                            className="overflow-hidden"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 mb-4">
                                <motion.div variants={item} className="space-y-2">
                                    <label htmlFor="name" className="flex items-center text-sm font-medium text-primary-foreground">
                                        <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                                        Machine Name<span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="relative">
                                        <Input
                                            id="name"
                                            name="name"
                                            value={machine.name}
                                            onChange={handleChange}
                                            placeholder="Enter machine name"
                                            required
                                            aria-required="true"
                                            className={`transition-all duration-200 focus:ring-primary-foreground ${
                                                validationErrors.name ? "border-red-500 focus:ring-red-500" : ""
                                            }`}
                                        />
                                        <AnimatePresence>
                                            {validationErrors.name && (
                                                <motion.div 
                                                    className="flex items-center mt-1 text-xs text-red-500"
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }}
                                                >
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {validationErrors.name}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>

                                <motion.div variants={item} className="space-y-2">
                                    <label htmlFor="mainPole" className="flex items-center text-sm font-medium text-primary-foreground">
                                        <Tool className="h-4 w-4 mr-2 text-muted-foreground" />
                                        Main Pole<span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <Input
                                        id="mainPole"
                                        name="mainPole"
                                        value={machine.mainPole}
                                        onChange={handleChange}
                                        placeholder="Enter main pole"
                                        required
                                        aria-required="true"
                                    />
                                </motion.div>

                                <motion.div variants={item} className="space-y-2">
                                    <label htmlFor="subPole" className="flex items-center text-sm font-medium text-primary-foreground">
                                        <Tool className="h-4 w-4 mr-2 text-muted-foreground" />
                                        Sub Pole<span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <Input
                                        id="subPole"
                                        name="subPole"
                                        value={machine.subPole}
                                        onChange={handleChange}
                                        placeholder="Enter sub pole"
                                        required
                                        aria-required="true"
                                    />
                                </motion.div>

                                <motion.div variants={item} className="space-y-2">
                                    <label htmlFor="pointsPerCycle" className="flex items-center text-sm font-medium text-primary-foreground">
                                        <Zap className="h-4 w-4 mr-2 text-muted-foreground" />
                                        Points Per Cycle<span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="relative">
                                        <Input
                                            id="pointsPerCycle"
                                            name="pointsPerCycle"
                                            type="number"
                                            value={machine.pointsPerCycle}
                                            onChange={handleChange}
                                            placeholder="Enter points per cycle"
                                            min="0"
                                            required
                                            aria-required="true"
                                            className={
                                                validationErrors.pointsPerCycle
                                                  ? "border-red-500 focus:ring-red-500"
                                                  : ""
                                            }
                                        />
                                        <AnimatePresence>
                                            {validationErrors.pointsPerCycle && (
                                                <motion.div 
                                                    className="flex items-center mt-1 text-xs text-red-500"
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }}
                                                >
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {validationErrors.pointsPerCycle}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>

                                <motion.div variants={item} className="space-y-2">
                                    <label htmlFor="maxUsers" className="flex items-center text-sm font-medium text-primary-foreground">
                                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                                        Max Users<span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="relative">
                                        <Input
                                            id="maxUsers"
                                            name="maxUsers"
                                            type="number"
                                            value={machine.maxUsers}
                                            onChange={handleChange}
                                            placeholder="Enter max users"
                                            min="1"
                                            required
                                            aria-required="true"
                                            className={
                                                validationErrors.maxUsers
                                                  ? "border-red-500 focus:ring-red-500"
                                                  : ""
                                            }
                                        />
                                        <AnimatePresence>
                                            {validationErrors.maxUsers && (
                                                <motion.div 
                                                    className="flex items-center mt-1 text-xs text-red-500"
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }}
                                                >
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {validationErrors.maxUsers}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>

                                <motion.div variants={item} className="space-y-2">
                                    <label htmlFor="requiredGrade" className="flex items-center text-sm font-medium text-primary-foreground">
                                        <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                                        Required Grade<span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <Select
                                        value={machine.requiredGrade}
                                        onValueChange={(value) => handleSelectChange("requiredGrade", value)}
                                        required
                                    >
                                        <SelectTrigger aria-required="true" id="requiredGrade">
                                            <SelectValue placeholder="Select grade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {grades.map((grade) => (
                                                <SelectItem key={grade._id} value={grade.name}>
                                                    {grade.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.section>

                    {/* Installation Site Section */}
                    <motion.section variants={item} className="space-y-4">
                        <motion.div 
                            className="flex items-center gap-2 text-xl font-semibold pb-2 border-b text-primary-foreground"
                            whileHover={{ scale: 1.01 }}
                        >
                            <Buildings className="h-5 w-5 text-primary-foreground" />
                            Installation Site
                        </motion.div>
                        <motion.div 
                            variants={sectionVariants}
                            initial="visible"
                            animate="visible"
                            className="overflow-hidden mb-4"
                        >
                            <div className="space-y-2 pt-4 relative z-20">
                                <label htmlFor="site" className="flex items-center text-sm font-medium text-primary-foreground">
                                    <Buildings className="h-4 w-4 mr-2 text-muted-foreground" />
                                    Select Site<span className="text-red-500 ml-1">*</span>
                                </label>
                                <Select
                                    value={machine.site}
                                    onValueChange={(value) => handleSelectChange("site", value)}
                                    required
                                >
                                    <SelectTrigger className={`${validationErrors.site ? "border-red-500" : ""}`}
                                                aria-required="true" 
                                                id="site">
                                        <SelectValue placeholder="Select installation site" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sites.map((site) => (
                                            <SelectItem key={site._id} value={site._id}>
                                                {site.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <AnimatePresence>
                                    {validationErrors.site && (
                                        <motion.div 
                                            className="flex items-center mt-1 text-xs text-red-500"
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            {validationErrors.site}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </motion.section>

                    {/* Sensors Section */}
                    <motion.section variants={item} className="space-y-4">
                        <motion.div 
                            className="flex items-center gap-2 text-xl font-semibold pb-2 border-b text-primary-foreground"
                            whileHover={{ scale: 1.01 }}
                        >
                            <ListFilter className="h-5 w-5 text-primary-foreground" />
                            Available Sensors
                        </motion.div>
                        <motion.div 
                            variants={sectionVariants}
                            initial="visible"
                            animate="visible"
                            className="overflow-hidden"
                        >
                            <div className="space-y-2 pt-4 relative z-10">
                                <label htmlFor="sensors" className="flex items-center text-sm font-medium text-primary-foreground">
                                    <ListFilter className="h-4 w-4 mr-2 text-muted-foreground" />
                                    Select Sensors<span className="text-red-500 ml-1">*</span>
                                </label>
                                <MultiSelect
                                    className={validationErrors.sensors ? "border-red-500" : ""}
                                    options={sensors.map((sensor) => ({
                                        value: sensor._id,
                                        label: sensor.designation,
                                    }))}
                                    selected={machine.availableSensors.map((sensorId) => {
                                        const sensor = sensors.find((s) => s._id === sensorId)
                                        return {
                                            value: sensorId,
                                            label: sensor?.designation || sensorId,
                                        }
                                    })}
                                    onChange={(selected) => {
                                        setMachine((prev) => ({
                                            ...prev,
                                            availableSensors: selected.map((item) => item.value),
                                        }))
                                        setFormTouched(true)
                                    }}
                                    placeholder="Select available sensors..."
                                    aria-label="Available sensors"
                                    showSelectAll={true}
                                    required
                                />
                                <AnimatePresence>
                                    {validationErrors.sensors && (
                                        <motion.div 
                                            className="flex items-center mt-1 text-xs text-red-500"
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            {validationErrors.sensors}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {machine.availableSensors.length} of {sensors.length} sensors selected
                                </div>
                            </div>
                        </motion.div>
                    </motion.section>

                    {/* Submit Button */}
                    <motion.div
                        className="flex justify-end pt-6"
                        variants={item}
                    >
                        <Button 
                            variant="secondary"
                            type="submit" 
                            data-action="close-overlay"
                            disabled={submitting || (!formTouched && Object.keys(validationErrors).length > 0)}
                            className="px-6 py-2 relative overflow-hidden group"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {submitting ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center"
                                >
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    <span>Processing...</span>
                                </motion.div>
                            ) : (
                                <>
                                    <motion.span>
                                        {user?.admin ? "Save Machine" : "Submit for Approval"}
                                    </motion.span>
                                    <motion.span 
                                        className="absolute bottom-0 left-0 w-0 h-0.5 bg-white" 
                                        initial={{ width: "0%" }}
                                        whileHover={{ width: "100%" }}
                                        transition={{ duration: 0.3 }}
                                    ></motion.span>
                                </>
                            )}
                        </Button>
                    </motion.div>
                </form>
            </motion.div>
        </motion.div>
    )
}
