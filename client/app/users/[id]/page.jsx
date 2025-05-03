"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useUser } from "@/contexts/UserContext"
import { useToastAlert } from "@/contexts/ToastContext"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    UserCircle,
    Building2,
    Calendar,
    Loader2,
    Shield,
    Mail,
    MapPin,
    Twitter,
    Linkedin,
    BadgeCheck,
    Briefcase,
    Building,
    Globe,
    FileText,
    ArrowLeft,
    Save,
    Upload,
    Trash2,
    Award,
    Rocket,
} from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"

// Animation variants
const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } }
}

const slideUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const itemFade = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
}

const cardHover = {
    rest: { scale: 1, transition: { duration: 0.2 } },
    hover: { scale: 1.02, transition: { duration: 0.2 } }
}

export default function EditUserPage() {
    const router = useRouter()
    const params = useParams()
    const { user } = useUser()
    const { toastError, toastSuccess } = useToastAlert()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [userData, setUserData] = useState(null)
    const [grades, setGrades] = useState([])
    const [sites, setSites] = useState([])
    const [isImageUploading, setIsImageUploading] = useState(false)
    const [avatarSrc, setAvatarSrc] = useState("")
    const [activeTab, setActiveTab] = useState("user-info")
    const [hasChanges, setHasChanges] = useState(false)

    // Form states
    const [userInfo, setUserInfo] = useState({
        username: "",
        email: "",
        bio: "",
        urls: {
            x: "",
            linkedin: "",
        },
        dob: "",
        location: "",
        grade: "",
        points: 0,
        photo: null,
    })

    const [employeeInfo, setEmployeeInfo] = useState({
        employeeId: "",
        email: "",
        position: "",
        department: "",
        office: "",
        contractType: "Full-time",
        hireDate: "",
        site: "",
    })

    const contractTypes = ["Full-time", "Part-time", "Contract", "Intern"]

    // Track form changes
    useEffect(() => {
        if (!userData) return

        const hasUserInfoChanges =
            userInfo.username !== (userData.username || "") ||
            userInfo.email !== (userData.email || "") ||
            userInfo.bio !== (userData.bio || "") ||
            userInfo.urls.x !== (userData.urls?.x || "") ||
            userInfo.urls.linkedin !== (userData.urls?.linkedin || "") ||
            userInfo.dob !== (userData.dob ? new Date(userData.dob).toISOString().split("T")[0] : "") ||
            userInfo.location !== (userData.location || "") ||
            userInfo.grade !== (userData.grade?._id || "") ||
            userInfo.points !== (userData.points || 0) ||
            avatarSrc !== (userData.photo || "")

        const hasEmployeeInfoChanges =
            employeeInfo.employeeId !== (userData.employee?.employeeId || "") ||
            employeeInfo.email !== (userData.employee?.email || "") ||
            employeeInfo.position !== (userData.employee?.position || "") ||
            employeeInfo.department !== (userData.employee?.department || "") ||
            employeeInfo.office !== (userData.employee?.office || "") ||
            employeeInfo.contractType !== (userData.employee?.contractType || "Full-time") ||
            employeeInfo.hireDate !==
            (userData.employee?.hireDate ? new Date(userData.employee.hireDate).toISOString().split("T")[0] : "") ||
            employeeInfo.site !== (userData.employee?.site?._id || "")

        setHasChanges(hasUserInfoChanges || hasEmployeeInfoChanges)
    }, [userInfo, employeeInfo, avatarSrc, userData])

    // Handle image upload
    function handleImageUpload(event) {
        const file = event.target.files && event.target.files[0]
        if (!file) return

        const maxSize = 2 * 1024 * 1024 // 2MB in bytes
        if (file.size > maxSize) {
            toastError("File is too large. Maximum allowed size is 2MB.")
            return
        }

        setIsImageUploading(true)
        const reader = new FileReader()
        reader.onload = (e) => {
            const dataUrl = e.target.result
            setAvatarSrc(dataUrl)
            setUserInfo((prev) => ({ ...prev, photo: dataUrl }))
            setIsImageUploading(false)
        }
        reader.readAsDataURL(file)
    }

    useEffect(() => {
        if (user === false) {
            router.replace("/login")
            return
        }

        if (!user?.admin) {
            router.replace("/users")
            return
        }

        const fetchData = async () => {
            try {
                const [userResponse, gradesResponse, sitesResponse] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/users/${params.id}`, {
                        credentials: "include",
                    }),
                    fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/grades`, {
                        credentials: "include",
                    }),
                    fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sites`, {
                        credentials: "include",
                    }),
                ])

                const userData = await userResponse.json()
                const gradesData = await gradesResponse.json()
                const sitesData = await sitesResponse.json()

                if (!userResponse.ok) throw new Error(userData.message)

                setUserData(userData)
                setGrades(gradesData)
                setSites(sitesData)
                setAvatarSrc(userData.photo || "")

                // Set form initial values
                setUserInfo({
                    username: userData.username || "",
                    email: userData.email || "",
                    bio: userData.bio || "",
                    urls: {
                        x: userData.urls?.x || "",
                        linkedin: userData.urls?.linkedin || "",
                    },
                    dob: userData.dob ? new Date(userData.dob).toISOString().split("T")[0] : "",
                    location: userData.location || "",
                    grade: userData.grade?._id || "",
                    points: userData.points || 0,
                    photo: userData.photo || null,
                })

                setEmployeeInfo({
                    employeeId: userData.employee?.employeeId || "",
                    email: userData.employee?.email || "",
                    position: userData.employee?.position || "",
                    department: userData.employee?.department || "",
                    office: userData.employee?.office || "",
                    contractType: userData.employee?.contractType || "Full-time",
                    hireDate: userData.employee?.hireDate ? new Date(userData.employee.hireDate).toISOString().split("T")[0] : "",
                    site: userData.employee?.site?._id || "",
                })
            } catch (error) {
                console.error("Error fetching data:", error)
                toastError(error.message || "Failed to load user data")
                router.replace("/users")
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [user, router, params.id, toastError])

    const handleUserInfoSubmit = async (e) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            const dataToSubmit = {
                ...userInfo,
                photo: avatarSrc,
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/users/${params.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(dataToSubmit),
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.message)

            setAvatarSrc(data.photo || "")
            setUserData((prev) => ({
                ...prev,
                ...data,
            }))
            toastSuccess("User information updated successfully")
        } catch (error) {
            console.error("Error updating user info:", error)
            toastError(error.message || "Failed to update user information")
        } finally {
            setIsSaving(false)
        }
    }

    const handleEmployeeInfoSubmit = async (e) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/users/${params.id}/employee`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(employeeInfo),
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.message)

            setUserData((prev) => ({
                ...prev,
                employee: data,
            }))
            toastSuccess("Employee information updated successfully")
        } catch (error) {
            console.error("Error updating employee info:", error)
            toastError(error.message || "Failed to update employee information")
        } finally {
            setIsSaving(false)
        }
    }

    // Get current grade info
    const getCurrentGrade = () => {
        if (!userInfo.grade || !grades.length) return null
        return grades.find((g) => g._id === userInfo.grade)
    }

    // Get next grade info
    const getNextGrade = () => {
        if (!userInfo.grade || !grades.length) return null
        const currentGradeIndex = grades.findIndex((g) => g._id === userInfo.grade)
        if (currentGradeIndex === -1 || currentGradeIndex === grades.length - 1) return null
        return grades[currentGradeIndex + 1]
    }

    // Calculate progress to next grade
    const calculateProgress = () => {
        const currentGrade = getCurrentGrade()
        const nextGrade = getNextGrade()

        if (!currentGrade || !nextGrade) return 0

        const currentThreshold = currentGrade.pointsThreshold || 0
        const nextThreshold = nextGrade.pointsThreshold || 100
        const pointsRange = nextThreshold - currentThreshold
        const userProgress = userInfo.points - currentThreshold

        return Math.min(100, Math.max(0, (userProgress / pointsRange) * 100))
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="h-10 w-48" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>

                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-72" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="flex justify-center">
                                <Skeleton className="h-32 w-32 rounded-full" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!user?.admin) {
        return (
            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                className="flex flex-col items-center justify-center h-[calc(100vh-200px)] p-4"
            >
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
                    <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                </motion.div>
                <motion.h2 variants={slideUp} className="text-2xl font-bold mb-2">Access Denied</motion.h2>
                <motion.p variants={slideUp} className="text-muted-foreground text-center">You do not have permission to edit users.</motion.p>
            </motion.div>
        )
    }

    return (
        <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="container mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
                >
                    <motion.div whileHover={{ x: 5 }} className="flex items-center space-x-4">
                        <motion.div 
                            whileHover={{ rotate: 10 }} 
                            className="bg-primary/10 p-2 rounded-full"
                        >
                            <UserCircle className="w-8 h-8 text-primary" />
                        </motion.div>
                        <div>
                            <h1 className="text-3xl font-bold">Edit User Profile</h1>
                            <p className="text-muted-foreground">
                                {userData?.username ? `Editing ${userData.username}'s profile` : "Update user information"}
                            </p>
                        </div>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="default"
                            onClick={() => router.back()}
                            className="flex items-center gap-2"
                            data-action="close-overlay"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Users
                        </Button>
                    </motion.div>
                </motion.div>

                {userData && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="grid grid-cols-1 lg:grid-cols-4 gap-6"
                    >
                        {/* User Summary Card */}
                        <motion.div
                            initial="rest"
                            whileHover="hover"
                            variants={cardHover}
                            className="lg:col-span-1"
                        >
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                                            <BadgeCheck className="h-5 w-5 text-muted-foreground" />
                                        </motion.div>
                                        User Summary
                                    </CardTitle>
                                    <CardDescription>Quick overview of user details</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <motion.div 
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex flex-col items-center text-center"
                                    >
                                        <div className="relative mb-4">
                                            <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                                                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                                                    <AvatarImage src={avatarSrc || "/placeholder.svg"} alt="Profile" />
                                                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                                                        {userData.username
                                                            ?.split(" ")
                                                            .map((name) => name.charAt(0).toUpperCase())
                                                            .join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </motion.div>
                                            {userData.admin && (
                                                <motion.div
                                                    initial={{ scale: 0, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{ delay: 0.3, type: "spring" }}
                                                >
                                                    <Badge className="absolute -top-2 -right-2 bg-secondary hover:bg-secondary">Admin</Badge>
                                                </motion.div>
                                            )}
                                        </div>
                                        <motion.h3 variants={itemFade} className="text-xl font-bold">{userData.username}</motion.h3>
                                        <motion.p variants={itemFade} className="text-sm text-muted-foreground">{userData.email}</motion.p>
                                    </motion.div>

                                    <Separator />

                                    {/* User Stats */}
                                    <motion.div 
                                        variants={staggerContainer}
                                        initial="hidden"
                                        animate="visible"
                                        className="space-y-3"
                                    >
                                        <motion.div variants={itemFade} className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <Award className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-medium">Current Grade</span>
                                            </div>
                                            <Badge variant="outline" className="font-normal text-accent-foreground">
                                                {getCurrentGrade()?.name || "None"}
                                            </Badge>
                                        </motion.div>

                                        <motion.div variants={itemFade} className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <Rocket className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-medium">Points</span>
                                            </div>
                                            <span className="font-medium">{userInfo.points}</span>
                                        </motion.div>

                                        {getNextGrade() && (
                                            <motion.div
                                                variants={itemFade}
                                                className="space-y-1.5"
                                            >
                                                <div className="flex justify-between text-xs">
                                                    <span>Progress to {getNextGrade()?.name}</span>
                                                    <span>{Math.round(calculateProgress())}%</span>
                                                </div>
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${calculateProgress()}%` }}
                                                    transition={{ duration: 1, delay: 0.5 }}
                                                    className="h-2 bg-primary rounded-full"
                                                    style={{
                                                        width: `${calculateProgress()}%`,
                                                        maxWidth: "100%"
                                                    }}
                                                />
                                            </motion.div>
                                        )}
                                    </motion.div>

                                    <Separator />

                                    {/* Employee Quick Info */}
                                    {userData.employee && (
                                        <motion.div
                                            variants={staggerContainer} 
                                            initial="hidden"
                                            animate="visible"
                                            transition={{ delayChildren: 0.3 }}
                                            className="space-y-3"
                                        >
                                            <motion.h4 variants={itemFade} className="text-sm font-medium flex items-center gap-2">
                                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                                Employee Details
                                            </motion.h4>

                                            <motion.div variants={itemFade} className="grid grid-cols-2 gap-y-2 text-sm">
                                                <span className="text-muted-foreground">ID:</span>
                                                <span className="font-medium">{userData.employee.employeeId}</span>

                                                <span className="text-muted-foreground">Department:</span>
                                                <span className="font-medium">{userData.employee.department}</span>

                                                <span className="text-muted-foreground">Position:</span>
                                                <span className="font-medium">{userData.employee.position}</span>
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Main Edit Form */}
                        <motion.div
                            initial="rest"
                            whileHover="hover"
                            variants={cardHover}
                            className="lg:col-span-3"
                        >
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-xl">Edit Profile Information</CardTitle>
                                    <CardDescription>Update user details and employee information</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                                        <TabsList className="grid grid-cols-2 mb-6">
                                            <TabsTrigger value="user-info" className="flex items-center gap-2">
                                                <UserCircle className="h-4 w-4 text-muted-foreground" />
                                                User Information
                                            </TabsTrigger>
                                            <TabsTrigger value="employee-info" className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                Employee Information
                                            </TabsTrigger>
                                        </TabsList>

                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={activeTab}
                                                initial={{ opacity: 0, x: activeTab === "user-info" ? -20 : 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: activeTab === "user-info" ? 20 : -20 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <TabsContent value="user-info" className="space-y-6">
                                                    <form onSubmit={handleUserInfoSubmit} className="space-y-6">
                                                        {/* Avatar Section */}
                                                        <div className="bg-muted/40 rounded-lg p-6">
                                                            <div className="grid place-items-center pb-4">
                                                                <div className="space-y-4 text-center mx-auto">
                                                                    <div className="relative flex justify-center">
                                                                        <Avatar className="h-32 w-32 border-4 border-background">
                                                                            <AvatarImage src={avatarSrc || "/placeholder.svg"} alt="Profile" />
                                                                            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                                                                                {userInfo.username
                                                                                    ?.split(" ")
                                                                                    .map((name) => name.charAt(0).toUpperCase())
                                                                                    .join("")}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        {isImageUploading && (
                                                                            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                                                                                <Loader2 className="h-8 w-8 animate-spin text-white" />
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <div className="flex flex-col gap-2">
                                                                        <p className="text-sm text-muted-foreground">Recommended size: 200x200px</p>
                                                                        <p className="text-sm text-muted-foreground">Supported formats: JPG, PNG, GIF</p>
                                                                        <p className="text-sm text-muted-foreground">Max size: 2MB</p>
                                                                    </div>

                                                                    <div className="flex gap-2 justify-center">
                                                                        <Label
                                                                            htmlFor="avatar-upload"
                                                                            className="cursor-pointer rounded-md border border-primary bg-accent-foreground px-3 py-2 text-sm text-primary font-medium shadow items-center flex justify-center"
                                                                        >
                                                                            <Upload className="h-4 w-4 mr-2" />
                                                                            Upload Photo
                                                                        </Label>
                                                                        <Input
                                                                            id="avatar-upload"
                                                                            type="file"
                                                                            accept="image/*"
                                                                            className="hidden"
                                                                            onChange={handleImageUpload}
                                                                        />
                                                                        <Button
                                                                            type="button"
                                                                            variant="secondary"
                                                                            className="hover:bg-destructive/10 hover:text-destructive border-secondary"
                                                                            data-action="close-overlay"
                                                                            onClick={() => {
                                                                                setAvatarSrc("")
                                                                                setUserInfo((prev) => ({ ...prev, photo: null }))
                                                                            }}
                                                                            disabled={isLoading || !avatarSrc}
                                                                        >
                                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                                            Remove
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="username" className="flex items-center gap-2">
                                                                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                                                                    Username
                                                                </Label>
                                                                <Input
                                                                    id="username"
                                                                    value={userInfo.username}
                                                                    onChange={(e) => setUserInfo({ ...userInfo, username: e.target.value })}
                                                                    className="border-input/60 focus:border-primary"
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="email" className="flex items-center gap-2">
                                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                                    Email
                                                                </Label>
                                                                <Input
                                                                    id="email"
                                                                    type="email"
                                                                    value={userInfo.email}
                                                                    onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                                                                    className="border-input/60 focus:border-primary"
                                                                />
                                                            </div>

                                                            <div className="space-y-2 md:col-span-2">
                                                                <Label htmlFor="bio" className="flex items-center gap-2">
                                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                                    Bio
                                                                </Label>
                                                                <Textarea
                                                                    id="bio"
                                                                    value={userInfo.bio}
                                                                    onChange={(e) => setUserInfo({ ...userInfo, bio: e.target.value })}
                                                                    className="border-input/60 focus:border-primary min-h-[100px]"
                                                                    placeholder="Tell us about this user..."
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="twitter" className="flex items-center gap-2">
                                                                    <Twitter className="h-4 w-4 text-muted-foreground" />
                                                                    Twitter Username
                                                                </Label>
                                                                <div className="relative">
                                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                                                                    <Input
                                                                        id="twitter"
                                                                        value={userInfo.urls.x}
                                                                        onChange={(e) =>
                                                                            setUserInfo({
                                                                                ...userInfo,
                                                                                urls: { ...userInfo.urls, x: e.target.value },
                                                                            })
                                                                        }
                                                                        className="pl-8 border-input/60 focus:border-primary"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="linkedin" className="flex items-center gap-2">
                                                                    <Linkedin className="h-4 w-4 text-muted-foreground" />
                                                                    LinkedIn Username
                                                                </Label>
                                                                <div className="relative">
                                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">in/</span>
                                                                    <Input
                                                                        id="linkedin"
                                                                        value={userInfo.urls.linkedin}
                                                                        onChange={(e) =>
                                                                            setUserInfo({
                                                                                ...userInfo,
                                                                                urls: { ...userInfo.urls, linkedin: e.target.value },
                                                                            })
                                                                        }
                                                                        className="pl-8 border-input/60 focus:border-primary"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="dob" className="flex items-center gap-2">
                                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                                    Date of Birth
                                                                </Label>
                                                                <Input
                                                                    id="dob"
                                                                    type="date"
                                                                    value={userInfo.dob}
                                                                    onChange={(e) => setUserInfo({ ...userInfo, dob: e.target.value })}
                                                                    className="border-input/60 focus:border-primary"
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="location" className="flex items-center gap-2">
                                                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                                                    Location
                                                                </Label>
                                                                <Input
                                                                    id="location"
                                                                    value={userInfo.location}
                                                                    onChange={(e) => setUserInfo({ ...userInfo, location: e.target.value })}
                                                                    className="border-input/60 focus:border-primary"
                                                                    placeholder="City, Country"
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="points" className="flex items-center gap-2">
                                                                    <Award className="h-4 w-4 text-muted-foreground" />
                                                                    Points
                                                                </Label>
                                                                <Input
                                                                    id="points"
                                                                    type="number"
                                                                    value={userInfo.points}
                                                                    onChange={(e) => setUserInfo({ ...userInfo, points: Number.parseInt(e.target.value) || 0 })}
                                                                    className="border-input/60 focus:border-primary"
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="grade" className="flex items-center gap-2">
                                                                    <Rocket className="h-4 w-4 text-muted-foreground" />
                                                                    Grade
                                                                </Label>
                                                                <Select
                                                                    value={userInfo.grade}
                                                                    onValueChange={(value) => setUserInfo({ ...userInfo, grade: value })}
                                                                >
                                                                    <SelectTrigger className="border-input/60 focus:border-primary">
                                                                        <SelectValue placeholder="Select grade" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {grades.map((grade) => (
                                                                            <SelectItem key={grade._id} value={grade._id}>
                                                                                {grade.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>

                                                        <CardFooter className="flex justify-end px-0 pt-4">
                                                            <Button
                                                                type="submit"
                                                                disabled={isSaving || !hasChanges}
                                                                variant="secondary"
                                                                className="flex items-center gap-2"
                                                                data-action="close-overlay"
                                                            >
                                                                {isSaving ? (
                                                                    <>
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                        Saving...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Save className="h-4 w-4" />
                                                                        Save User Information
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </CardFooter>
                                                    </form>
                                                </TabsContent>

                                                <TabsContent value="employee-info" className="space-y-6">
                                                    <form onSubmit={handleEmployeeInfoSubmit} className="space-y-6">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="employeeId" className="flex items-center gap-2">
                                                                    <BadgeCheck className="h-4 w-4 text-muted-foreground" />
                                                                    Employee ID
                                                                </Label>
                                                                <Input
                                                                    id="employeeId"
                                                                    value={employeeInfo.employeeId}
                                                                    onChange={(e) => setEmployeeInfo({ ...employeeInfo, employeeId: e.target.value })}
                                                                    className="border-input/60 focus:border-primary"
                                                                    placeholder="EMP-12345"
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="employeeEmail" className="flex items-center gap-2">
                                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                                    Work Email
                                                                </Label>
                                                                <Input
                                                                    id="employeeEmail"
                                                                    type="email"
                                                                    value={employeeInfo.email}
                                                                    onChange={(e) => setEmployeeInfo({ ...employeeInfo, email: e.target.value })}
                                                                    className="border-input/60 focus:border-primary"
                                                                    placeholder="work@example.com"
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="position" className="flex items-center gap-2">
                                                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                                                    Position
                                                                </Label>
                                                                <Input
                                                                    id="position"
                                                                    value={employeeInfo.position}
                                                                    onChange={(e) => setEmployeeInfo({ ...employeeInfo, position: e.target.value })}
                                                                    className="border-input/60 focus:border-primary"
                                                                    placeholder="Software Engineer"
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="department" className="flex items-center gap-2">
                                                                    <Building className="h-4 w-4 text-muted-foreground" />
                                                                    Department
                                                                </Label>
                                                                <Input
                                                                    id="department"
                                                                    value={employeeInfo.department}
                                                                    onChange={(e) => setEmployeeInfo({ ...employeeInfo, department: e.target.value })}
                                                                    className="border-input/60 focus:border-primary"
                                                                    placeholder="Engineering"
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="office" className="flex items-center gap-2">
                                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                                    Office
                                                                </Label>
                                                                <Input
                                                                    id="office"
                                                                    value={employeeInfo.office}
                                                                    onChange={(e) => setEmployeeInfo({ ...employeeInfo, office: e.target.value })}
                                                                    className="border-input/60 focus:border-primary"
                                                                    placeholder="HQ - Floor 3"
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="contractType" className="flex items-center gap-2">
                                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                                    Contract Type
                                                                </Label>
                                                                <Select
                                                                    value={employeeInfo.contractType}
                                                                    onValueChange={(value) => setEmployeeInfo({ ...employeeInfo, contractType: value })}
                                                                >
                                                                    <SelectTrigger className="border-input/60 focus:border-primary">
                                                                        <SelectValue placeholder="Select contract type" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {contractTypes.map((type) => (
                                                                            <SelectItem key={type} value={type}>
                                                                                {type}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="hireDate" className="flex items-center gap-2">
                                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                                    Hire Date
                                                                </Label>
                                                                <Input
                                                                    id="hireDate"
                                                                    type="date"
                                                                    value={employeeInfo.hireDate}
                                                                    onChange={(e) => setEmployeeInfo({ ...employeeInfo, hireDate: e.target.value })}
                                                                    className="border-input/60 focus:border-primary"
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="site" className="flex items-center gap-2">
                                                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                                                    Site
                                                                </Label>
                                                                <Select
                                                                    value={employeeInfo.site}
                                                                    onValueChange={(value) => setEmployeeInfo({ ...employeeInfo, site: value })}
                                                                >
                                                                    <SelectTrigger className="border-input/60 focus:border-primary">
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
                                                        </div>

                                                        <CardFooter className="flex justify-end px-0 pt-4">
                                                            <Button 
                                                                type="submit" 
                                                                disabled={isSaving || !hasChanges} 
                                                                variant="secondary" 
                                                                className="flex items-center gap-2"
                                                                data-action="close-overlay"
                                                            >
                                                                {isSaving ? (
                                                                    <>
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                        Saving...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Save className="h-4 w-4" />
                                                                        Save Employee Information
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </CardFooter>
                                                    </form>
                                                </TabsContent>
                                            </motion.div>
                                        </AnimatePresence>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </ScrollArea>
    )
}
