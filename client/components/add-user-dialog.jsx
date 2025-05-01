"use client"

import { useState, useEffect } from "react"
import { useToastAlert } from "@/contexts/ToastContext"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    ChevronRight,
    ChevronLeft,
    BadgeCheck,
    Building2,
    Briefcase,
    MapPin,
    Calendar,
    User,
    Mail,
    Lock,
    GraduationCap,
    Globe,
    FileText,
    ShieldAlert,
    AlertCircle,
    Rocket,
    Orbit,
    Satellite,
    UserPlus,
    UserCheck,
    Sparkles,
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"

export function AddUserDialog({ open, onOpenChange, onSuccess, sites, grades }) {
    const { toastError, toastSuccess } = useToastAlert()
    const [formStep, setFormStep] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [employeeType, setEmployeeType] = useState("new") // "new" or "existing"
    const [unlinkedEmployees, setUnlinkedEmployees] = useState([])
    const [formData, setFormData] = useState({
        // User data
        username: "",
        email: "",
        password: "",
        admin: false,
        location: "",
        bio: "",
        grade: "default",
        // Employee data
        employeeId: "",
        existingEmployeeId: "",
        department: "",
        position: "",
        office: "",
        contractType: "Full-time",
        site: "",
        hireDate: new Date().toISOString().split("T")[0],
    })

    useEffect(() => {
        const fetchUnlinkedEmployees = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/users/unlinked-employees`, {
                    credentials: "include",
                })
                if (!response.ok) throw new Error("Failed to fetch unlinked employees")
                const data = await response.json()
                setUnlinkedEmployees(data)
            } catch (error) {
                console.error("Error fetching unlinked employees:", error)
                toastError("Failed to fetch unlinked employees")
            }
        }

        if (open) {
            fetchUnlinkedEmployees()
        }
    }, [open, toastError])

    const clearError = () => setError(null)

    const handleCreate = async () => {
        clearError()
        setIsLoading(true)
        try {
            const endpoint = employeeType === "new" ? "create-with-employee" : "create-with-existing-employee"

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/users/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(
                    employeeType === "new"
                        ? formData
                        : {
                            username: formData.username,
                            email: formData.email,
                            password: formData.password,
                            admin: formData.admin,
                            location: formData.location,
                            bio: formData.bio,
                            grade: formData.grade,
                            employeeId: formData.existingEmployeeId,
                        },
                ),
            })

            const data = await response.json()

            if (!response.ok) {
                if (response.status === 409) {
                    setError({
                        message: data.details,
                        field: data.field,
                    })
                    return
                } else if (response.status === 400) {
                    setError({
                        message: data.details,
                        type: "validation",
                    })
                    return
                }
                throw new Error(data.message || "Failed to create user")
            }

            toastSuccess("Astronaut successfully added to the crew!", {
                description: `${formData.username} is now ready for their space mission.`,
            })
            clearError()
            onOpenChange(false)
            setFormStep(0)
            setEmployeeType("new")
            setFormData({
                username: "",
                email: "",
                password: "",
                admin: false,
                location: "",
                bio: "",
                grade: "default",
                employeeId: "",
                existingEmployeeId: "",
                department: "",
                position: "",
                office: "",
                contractType: "Full-time",
                site: "",
                hireDate: new Date().toISOString().split("T")[0],
            })
            onSuccess?.()
        } catch (error) {
            setError({
                message: error.message,
                type: "general",
            })
            toastError("Mission aborted!", { description: error.message || "Failed to add new crew member" })
        } finally {
            setIsLoading(false)
        }
    }

    const isStep1Valid = formData.username && formData.email && formData.password
    const isStep2Valid =
        employeeType === "existing"
            ? formData.existingEmployeeId
            : formData.employeeId && formData.department && formData.position && formData.office && formData.site

    const getProgressPercentage = () => {
        let percentage = 0
        const step1Fields = ["username", "email", "password"]
        const step2Fields =
            employeeType === "new" ? ["employeeId", "department", "position", "office", "site"] : ["existingEmployeeId"]

        // Count filled fields in step 1
        step1Fields.forEach((field) => {
            if (formData[field]) percentage += 10
        })

        // Count filled fields in step 2
        if (formStep === 1) {
            step2Fields.forEach((field) => {
                if (formData[field]) percentage += 10
            })
        }

        return Math.min(100, percentage)
    }

    const getSelectedEmployee = () => {
        return unlinkedEmployees.find((e) => e._id === formData.existingEmployeeId)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <div className="flex items-center space-x-2">
                        <Orbit className="h-5 w-5 text-primary animate-spin" style={{ animationDuration: "10s" }} />
                        <DialogTitle className="text-xl">Add New Crew Member</DialogTitle>
                        <Satellite className="h-5 w-5 text-primary animate-bounce" style={{ animationDuration: "2s" }} />
                    </div>
                    <DialogDescription>
                        {formStep === 0
                            ? "Enter astronaut's personal details and access credentials"
                            : "Complete mission-critical employment information"}
                    </DialogDescription>
                </DialogHeader>

                {/* Progress Bar */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Mission Progress</span>
                        <span>{getProgressPercentage()}%</span>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/20">
                        <div
                            className="h-full transition-all bg-gradient-to-r from-primary to-secondary"
                            style={{ width: `${getProgressPercentage()}%` }}
                        />
                    </div>
                </div>

                {error && (
                    <div className="mt-2 text-sm text-red-500 bg-red-50 p-3 rounded-md border border-red-200 flex items-start">
                        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold">Mission Alert:</p>
                            <p>{error.message}</p>
                        </div>
                    </div>
                )}

                <Tabs value={formStep === 0 ? "account" : "employment"} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger
                            value="account"
                            onClick={() => setFormStep(0)}
                            disabled={formStep === 1 && !isStep1Valid}
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                            <User className="h-4 w-4 mr-2" />
                            Account
                        </TabsTrigger>
                        <TabsTrigger
                            value="employment"
                            onClick={() => isStep1Valid && setFormStep(1)}
                            disabled={!isStep1Valid}
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                            <Briefcase className="h-4 w-4 mr-2" />
                            Employment
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="account" className="space-y-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="flex items-center">
                                    <User className="h-4 w-4 mr-2 text-primary" />
                                    Username
                                </Label>
                                <Input
                                    id="username"
                                    value={formData.username}
                                    onChange={(e) => {
                                        clearError()
                                        setFormData({ ...formData, username: e.target.value })
                                    }}
                                    className={error?.field === "username" ? "border-red-500" : ""}
                                    placeholder="astronaut42"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center">
                                    <Mail className="h-4 w-4 mr-2 text-primary" />
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => {
                                        clearError()
                                        setFormData({ ...formData, email: e.target.value })
                                    }}
                                    className={error?.field === "email" ? "border-red-500" : ""}
                                    placeholder="astronaut@spacey.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="flex items-center">
                                    <Lock className="h-4 w-4 mr-2 text-primary" />
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Secure password"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="grade" className="flex items-center">
                                    <GraduationCap className="h-4 w-4 mr-2 text-primary" />
                                    Grade
                                </Label>
                                <Select value={formData.grade} onValueChange={(value) => setFormData({ ...formData, grade: value })}>
                                    <SelectTrigger id="grade">
                                        <SelectValue placeholder="Select grade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="default">Default (Apprentice)</SelectItem>
                                        {grades?.map((grade) => (
                                            <SelectItem key={grade._id} value={grade._id}>
                                                {grade.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location" className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                                    Location
                                </Label>
                                <Input
                                    id="location"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="Earth, Mars, etc."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio" className="flex items-center">
                                    <FileText className="h-4 w-4 mr-2 text-primary" />
                                    Bio
                                </Label>
                                <Input
                                    id="bio"
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Brief description about the astronaut"
                                />
                            </div>
                        </div>

                        <div className="bg-muted/50 p-3 rounded-md border border-muted">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="admin"
                                    checked={formData.admin}
                                    onCheckedChange={(checked) => setFormData({ ...formData, admin: checked })}
                                />
                                <div>
                                    <Label htmlFor="admin" className="flex items-center text-sm font-medium text-secondary">
                                        <ShieldAlert className="h-4 w-4 mr-2 text-secondary" />
                                        Grant Mission Control Access
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        This gives the user administrative privileges to manage the system
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Abort
                            </Button>
                            <Button
                                onClick={() => setFormStep(1)}
                                disabled={!isStep1Valid}
                                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
                            >
                                Continue
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="employment" className="space-y-4 py-4">
                        <div className="bg-muted/30 p-4 rounded-lg border border-muted">
                            <RadioGroup
                                value={employeeType}
                                onValueChange={setEmployeeType}
                                className="flex flex-col sm:flex-row gap-4"
                            >
                                <div className="flex items-center space-x-2 bg-background p-3 rounded-md border border-muted flex-1 hover:border-primary/50 transition-colors">
                                    <RadioGroupItem value="new" id="new" />
                                    <Label htmlFor="new" className="flex items-center cursor-pointer">
                                        <UserPlus className="h-5 w-5 mr-2 text-secondary" />
                                        <div>
                                            <span className="font-medium">New Recruit</span>
                                            <p className="text-xs text-muted-foreground">Create a new employee record</p>
                                        </div>
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 bg-background p-3 rounded-md border border-muted flex-1 hover:border-primary/50 transition-colors">
                                    <RadioGroupItem value="existing" id="existing" />
                                    <Label htmlFor="existing" className="flex items-center cursor-pointer">
                                        <UserCheck className="h-5 w-5 mr-2 text-green-500" />
                                        <div>
                                            <span className="font-medium">Existing Crew</span>
                                            <p className="text-xs text-muted-foreground">Link to an existing employee</p>
                                        </div>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {employeeType === "new" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="employeeId" className="flex items-center">
                                        <BadgeCheck className="h-4 w-4 mr-2 text-primary" />
                                        Employee ID
                                    </Label>
                                    <Input
                                        id="employeeId"
                                        value={formData.employeeId}
                                        onChange={(e) => {
                                            clearError()
                                            setFormData({ ...formData, employeeId: e.target.value })
                                        }}
                                        className={error?.field === "employeeId" ? "border-red-500" : ""}
                                        placeholder="ASTRO-123"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="department" className="flex items-center">
                                        <Building2 className="h-4 w-4 mr-2 text-primary" />
                                        Department
                                    </Label>
                                    <Input
                                        id="department"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        placeholder="Engineering, Science, etc."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="position" className="flex items-center">
                                        <Briefcase className="h-4 w-4 mr-2 text-primary" />
                                        Position
                                    </Label>
                                    <Input
                                        id="position"
                                        value={formData.position}
                                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                        placeholder="Flight Engineer, Scientist, etc."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="office" className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-2 text-primary" />
                                        Office
                                    </Label>
                                    <Input
                                        id="office"
                                        value={formData.office}
                                        onChange={(e) => setFormData({ ...formData, office: e.target.value })}
                                        placeholder="Deck 5, Lab 3, etc."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contractType" className="flex items-center">
                                        <FileText className="h-4 w-4 mr-2 text-primary" />
                                        Contract Type
                                    </Label>
                                    <Select
                                        value={formData.contractType}
                                        onValueChange={(value) => setFormData({ ...formData, contractType: value })}
                                    >
                                        <SelectTrigger id="contractType">
                                            <SelectValue placeholder="Select contract type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Full-time">Full-time</SelectItem>
                                            <SelectItem value="Part-time">Part-time</SelectItem>
                                            <SelectItem value="Contract">Contract</SelectItem>
                                            <SelectItem value="Intern">Intern</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="site" className="flex items-center">
                                        <Globe className="h-4 w-4 mr-2 text-primary" />
                                        Site
                                    </Label>
                                    <Select value={formData.site} onValueChange={(value) => setFormData({ ...formData, site: value })}>
                                        <SelectTrigger id="site">
                                            <SelectValue placeholder="Select site" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sites.map((site) => (
                                                <SelectItem key={site._id} value={site._id}>
                                                    {site.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="hireDate" className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                                        Hire Date
                                    </Label>
                                    <Input
                                        id="hireDate"
                                        type="date"
                                        value={formData.hireDate}
                                        onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="existingEmployee" className="flex items-center">
                                        <UserCheck className="h-4 w-4 mr-2 text-primary" />
                                        Select Existing Crew Member
                                    </Label>
                                    <Select
                                        value={formData.existingEmployeeId}
                                        onValueChange={(value) => setFormData({ ...formData, existingEmployeeId: value })}
                                    >
                                        <SelectTrigger id="existingEmployee">
                                            <SelectValue placeholder="Select an employee" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {unlinkedEmployees.length === 0 ? (
                                                <SelectItem value="none" disabled>
                                                    No unlinked employees found
                                                </SelectItem>
                                            ) : (
                                                unlinkedEmployees.map((employee) => (
                                                    <SelectItem key={employee._id} value={employee._id}>
                                                        {employee.employeeId} - {employee.department}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {formData.existingEmployeeId && getSelectedEmployee() && (
                                    <Card className="overflow-hidden border-primary bg-background/10 shadow-md">
                                        <div className="absolute top-0 right-0 p-1.5">
                                            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                                        </div>
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex items-center space-x-2">
                                                <BadgeCheck className="h-5 w-5 text-primary" />
                                                <h3 className="font-medium text-primary">Crew Member Details</h3>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="flex items-center space-x-2">
                                                    <Building2 className="h-4 w-4 text-primary" />
                                                    <span className="text-muted-foreground">Department:</span>
                                                </div>
                                                <div className="font-medium text-primary">{getSelectedEmployee().department}</div>

                                                <div className="flex items-center space-x-2">
                                                    <Briefcase className="h-4 w-4 text-primary" />
                                                    <span className="text-muted-foreground">Position:</span>
                                                </div>
                                                <div className="font-medium text-primary">{getSelectedEmployee().position}</div>

                                                <div className="flex items-center space-x-2">
                                                    <Globe className="h-4 w-4 text-primary" />
                                                    <span className="text-muted-foreground">Site:</span>
                                                </div>
                                                <div className="font-medium text-primary">{getSelectedEmployee().site?.name}</div>

                                                <div className="flex items-center space-x-2">
                                                    <Calendar className="h-4 w-4 text-primary" />
                                                    <span className="text-muted-foreground">ID:</span>
                                                </div>
                                                <div className="font-medium text-primary">{getSelectedEmployee().employeeId}</div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}

                        <div className="flex justify-between space-x-2 pt-4">
                            <Button variant="outline" onClick={() => setFormStep(0)}>
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                            <Button
                                onClick={handleCreate}
                                disabled={isLoading || !isStep2Valid}
                                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
                            >
                                {isLoading ? (
                                    <>
                                        <Orbit className="mr-2 h-4 w-4 animate-spin" />
                                        Launching...
                                    </>
                                ) : (
                                    <>
                                        <Rocket className="mr-2 h-4 w-4" />
                                        Launch Mission
                                    </>
                                )}
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
