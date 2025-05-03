"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import Link from "next/link"

// Contexts
import { useUser } from "@/contexts/UserContext"
import { useToastAlert } from "@/contexts/ToastContext"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Icons
import {
    Search, Users, Filter, X, UserCircle, Mail, MapPin, Calendar,
    Twitter, Linkedin, Loader2, Shield, Briefcase, Building2, Building,
    Clock, Plus, UserPlus, Star, User2, Award, Hash, Phone, Trash2, Pencil,
    AlertCircle
} from "lucide-react"

// Framer Motion
import { motion, AnimatePresence } from "framer-motion"

// Custom Components
import { AddUserDialog } from "@/components/add-user-dialog"

// Animation variants
const animationVariants = {
    fadeIn: {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.4 }
        }
    },
    slideUp: {
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
    },
    containerStagger: {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.1,
                duration: 0.3
            }
        }
    },
    cardSpring: {
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
    },
    drawerSlide: {
        hidden: { opacity: 0, x: "100%" },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        },
        exit: {
            opacity: 0,
            x: "100%",
            transition: { duration: 0.2 }
        }
    },
    loadingRotate: {
        rotate: {
            rotate: 360,
            transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
            }
        }
    }
}

export default function UserSearchPage() {
    const { user } = useUser()
    const router = useRouter()
    const { toastError, toastSuccess } = useToastAlert()
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [users, setUsers] = useState([])
    const [filteredUsers, setFilteredUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [sortOption, setSortOption] = useState("username")
    const [filterGrade, setFilterGrade] = useState("all")
    const [grades, setGrades] = useState([])
    const [sites, setSites] = useState([])
    const [isAddUserOpen, setIsAddUserOpen] = useState(false)

    const { register, watch, reset } = useForm({
        defaultValues: {
            searchTerm: "",
        },
    })

    const searchTerm = watch("searchTerm")

    const fetchUsers = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/users`, {
                method: "GET",
                credentials: "include",
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.message)
            setUsers(data)
            setFilteredUsers(data)
        } catch (err) {
            console.error("Error fetching users:", err)
            toastError("Error fetching users. Please try again.")
            router.replace("/login")
        } finally {
            setIsLoading(false)
        }
    }, [router, toastError])

    const filterUsers = useCallback(() => {
        if (!users.length) return

        let result = [...users]

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            result = result.filter(
                (user) =>
                    user.username.toLowerCase().includes(term) ||
                    (user.email && user.email.toLowerCase().includes(term)) ||
                    (user.location && user.location.toLowerCase().includes(term)) ||
                    (user.grade?.name && user.grade.name.toLowerCase().includes(term))
            )
        }

        // Apply grade filter
        if (filterGrade !== "all") {
            result = result.filter((user) => user.grade?._id === filterGrade)
        }

        // Apply sorting
        result.sort((a, b) => {
            switch (sortOption) {
                case "username":
                    return a.username.localeCompare(b.username)
                case "email":
                    return (a.email || "").localeCompare(b.email || "")
                case "location":
                    return (a.location || "").localeCompare(b.location || "")
                case "newest":
                    return new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()
                case "oldest":
                    return new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime()
                default:
                    return 0
            }
        })

        setFilteredUsers(result)
    }, [users, searchTerm, filterGrade, sortOption])

    const fetchGrades = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/grades`, {
                method: "GET",
                credentials: "include",
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.message)
            setGrades(data)
        } catch (err) {
            console.error("Error fetching grades:", err)
            toastError("Error fetching grades. Please try again.")
        }
    }, [toastError])

    const fetchSites = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sites`, {
                method: "GET",
                credentials: "include",
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.message)
            setSites(data)
        } catch (err) {
            console.error("Error fetching sites:", err)
            toastError("Error fetching sites. Please try again.")
        }
    }, [toastError])

    useEffect(() => {
        if (user === false) {
            router.replace("/")
            return
        }
        if (user) {
            fetchUsers()
            fetchGrades()
            fetchSites()
        }
    }, [user, router, fetchUsers, fetchGrades, fetchSites])

    useEffect(() => {
        filterUsers()
    }, [filterUsers])

    const handleUserClick = (user) => {
        setSelectedUser(user)
        setIsDrawerOpen(true)
    }

    const clearSearch = () => {
        reset()
        setFilterGrade("all")
        setSortOption("username")
    }

    const formatDate = (dateString) => {
        if (!dateString) return "N/A"
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const getInitials = (name) => {
        return name
            .split(" ")
            .map((part) => part.charAt(0).toUpperCase())
            .join("")
    }

    if (user === undefined) {
        return (
            <motion.div
                className="flex items-center justify-center h-[calc(100vh-200px)]"
                initial="hidden"
                animate="visible"
                variants={animationVariants.fadeIn}
            >
                <motion.div animate={animationVariants.loadingRotate.rotate}>
                    <Loader2 className="h-8 w-8 text-muted-foreground" />
                </motion.div>
            </motion.div>
        )
    }

    if (user === false) {
        return (
            <motion.div
                className="flex flex-col items-center justify-center h-[calc(100vh-200px)] p-4"
                initial="hidden"
                animate="visible"
                variants={animationVariants.containerStagger}
            >
                <motion.div
                    variants={animationVariants.slideUp}
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
                    variants={animationVariants.slideUp}
                >
                    Access Denied
                </motion.h2>
                <motion.p
                    className="text-muted-foreground text-center"
                    variants={animationVariants.slideUp}
                >
                    Please log in to view users.
                </motion.p>
            </motion.div>
        )
    }

    return (
        <>
            <div className="h-full mt-8 mx-auto px-4 py-8">
                <motion.div
                    className="flex items-center justify-between"
                    initial="hidden"
                    animate="visible"
                    variants={animationVariants.fadeIn}
                >
                    <div className="flex items-center space-x-4">
                        <Users className="w-8 h-8" />
                        <h1 className="text-4xl font-black font-mono text-start">Users</h1>
                    </div>
                    {user?.admin && (
                        <Button
                            variant="default"
                            className="flex items-center gap-2"
                            onClick={() => setIsAddUserOpen(true)}
                            data-action="close-overlay"
                        >
                            <UserPlus className="w-4 h-4" />
                            Add User
                        </Button>
                    )}
                </motion.div>

                {/* Search and Filter Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    <Card className="mb-8 shadow-lg mt-12">
                        <CardContent className="p-6">
                            <motion.div
                                className="flex flex-col space-y-4"
                                initial="hidden"
                                animate="visible"
                                variants={animationVariants.slideUp}
                            >
                                <div className="relative">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        className="absolute left-3 top-2 h-5 w-5"
                                    >
                                        <Search className="h-5 w-5 text-muted-foreground" />
                                    </motion.div>
                                    <Input
                                        placeholder="Search by name, email, or location..."
                                        className="pl-10 border-2"
                                        {...register("searchTerm")}
                                    />
                                    {searchTerm && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                        >
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-3 top-1.5 h-6 w-6 text-muted-foreground hover:text-foreground"
                                                onClick={clearSearch}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </motion.div>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <motion.div
                                        className="flex items-center gap-2 flex-1"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.3 }}>
                                            <Filter className="h-5 w-5 text-muted-foreground" />
                                        </motion.div>
                                        <Select value={filterGrade} onValueChange={setFilterGrade}>
                                            <SelectTrigger className="border-2">
                                                <SelectValue placeholder="Filter by grade" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Grades</SelectItem>
                                                {grades.map((grade) => (
                                                    <SelectItem key={grade._id} value={grade._id}>
                                                        {grade.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </motion.div>

                                    <motion.div
                                        className="flex items-center gap-2 flex-1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <span className="text-muted-foreground">Sort by:</span>
                                        <Select value={sortOption} onValueChange={setSortOption}>
                                            <SelectTrigger className="border-2">
                                                <SelectValue placeholder="Sort by" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="username">Name (A-Z)</SelectItem>
                                                <SelectItem value="email">Email (A-Z)</SelectItem>
                                                <SelectItem value="location">Location (A-Z)</SelectItem>
                                                <SelectItem value="newest">Newest First</SelectItem>
                                                <SelectItem value="oldest">Oldest First</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    className="mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <p className="text-muted-foreground">
                        {isLoading ? "Loading users..." : `${filteredUsers.length} users found`}
                    </p>
                </motion.div>

                {isLoading ? (
                    <motion.div
                        className="flex justify-center items-center h-64"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.div animate={animationVariants.loadingRotate.rotate}>
                            <Loader2 className="h-8 w-8 text-accent-foreground" />
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                        initial="hidden"
                        animate="visible"
                        variants={animationVariants.containerStagger}
                    >
                        {filteredUsers.map((user) => (
                            <motion.div
                                key={user._id}
                                variants={animationVariants.cardSpring}
                            >
                                <Card
                                    className="overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                                    onClick={() => handleUserClick(user)}
                                >
                                    <CardContent className="p-0">
                                        <div className="flex flex-col items-center">
                                            <div className="bg-accent-foreground w-full h-12"></div>
                                            <Avatar className="h-16 w-16 border-4 border-background -mt-8 mb-2">
                                                <AvatarImage src={user.photo} alt={user.username} />
                                                <AvatarFallback className="bg-secondary text-secondary-foreground">
                                                    {getInitials(user.username)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="w-full px-4 pb-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <User2 className="h-4 w-4 text-accent-foreground" />
                                                        <h3 className="font-bold text-lg truncate">{user.username}</h3>
                                                    </div>
                                                    {user.grade && (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <Badge variant="outline" className="ml-2 text-accent-foreground flex items-center gap-1">
                                                                        <Award className="h-3 w-3" />
                                                                        {user.grade.name}
                                                                    </Badge>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    Grade Level
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    {user.employee?.employeeId && (
                                                        <div className="flex items-center text-sm text-muted-foreground">
                                                            <Hash className="h-4 w-4 mr-2" />
                                                            <span className="truncate">ID: {user.employee.employeeId}</span>
                                                        </div>
                                                    )}
                                                    {user.email && (
                                                        <div className="flex items-center text-sm text-muted-foreground">
                                                            <Mail className="h-4 w-4 mr-2" />
                                                            <span className="truncate">{user.email}</span>
                                                        </div>
                                                    )}
                                                    {user.phone && (
                                                        <div className="flex items-center text-sm text-muted-foreground">
                                                            <Phone className="h-4 w-4 mr-2" />
                                                            <span className="truncate">{user.phone}</span>
                                                        </div>
                                                    )}
                                                    {user.location && (
                                                        <div className="flex items-center text-sm text-muted-foreground">
                                                            <MapPin className="h-4 w-4 mr-2" />
                                                            <span className="truncate">{user.location}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {filteredUsers.length === 0 && !isLoading && (
                    <motion.div
                        className="text-center py-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="mx-auto"
                        >
                            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        </motion.div>
                        <motion.h3
                            className="text-xl font-bold mb-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            No users found
                        </motion.h3>
                        <motion.p
                            className="text-muted-foreground"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            Try adjusting your search or filter criteria
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, type: "spring" }}
                        >
                            <Button variant="outline" className="mt-4" onClick={clearSearch}>
                                Clear filters
                            </Button>
                        </motion.div>
                    </motion.div>
                )}

                {/* User Detail Sheet */}
                {selectedUser && (
                    <AnimatePresence>
                        {isDrawerOpen && (
                            <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                                <SheetContent className="sm:max-w-md overflow-y-auto">
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <SheetHeader className="mb-4">
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1, duration: 0.3 }}
                                            >
                                                <SheetTitle>User Profile</SheetTitle>
                                            </motion.div>
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.2, duration: 0.3 }}
                                            >
                                                <SheetDescription>Comprehensive information about {selectedUser.username}</SheetDescription>
                                            </motion.div>
                                        </SheetHeader>

                                        <motion.div
                                            className="space-y-6"
                                            initial="hidden"
                                            animate="visible"
                                            variants={animationVariants.containerStagger}
                                        >
                                            {/* Avatar and Basic Info */}
                                            <motion.div
                                                className="flex flex-col items-center text-center"
                                                variants={animationVariants.cardSpring}
                                                whileHover={{ scale: 1.02 }}
                                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                            >
                                                <motion.div
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 400,
                                                        damping: 15
                                                    }}
                                                >
                                                    <Avatar className="h-24 w-24 mb-4">
                                                        <AvatarImage src={selectedUser.photo} alt={selectedUser.username} />
                                                        <AvatarFallback className="bg-secondary text-secondary-foreground text-xl">
                                                            {getInitials(selectedUser.username)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </motion.div>
                                                <motion.h2
                                                    className="text-2xl font-bold"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.2, duration: 0.3 }}
                                                >
                                                    {selectedUser.username}
                                                </motion.h2>
                                                {selectedUser.grade && (
                                                    <motion.div
                                                        initial={{ scale: 0, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        transition={{
                                                            delay: 0.3,
                                                            type: "spring",
                                                            stiffness: 500,
                                                            damping: 20
                                                        }}
                                                        whileHover={{
                                                            scale: 1.1,
                                                            backgroundColor: selectedUser.grade.color || "var(--accent)",
                                                            color: "var(--accent-foreground)",
                                                            transition: { duration: 0.2 }
                                                        }}
                                                    >
                                                        <Badge
                                                            variant="outline"
                                                            className="mt-2 text-accent-foreground flex items-center gap-1"
                                                            style={{
                                                                borderColor: selectedUser.grade.color || "currentColor"
                                                            }}
                                                        >
                                                            {selectedUser.grade.icon && (
                                                                <span className="text-xs" dangerouslySetInnerHTML={{ __html: selectedUser.grade.icon }} />
                                                            )}
                                                            {selectedUser.grade.name}
                                                        </Badge>
                                                    </motion.div>
                                                )}

                                                {selectedUser.bio && (
                                                    <motion.p
                                                        className="text-muted-foreground mt-4 text-sm"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 0.4, duration: 0.5 }}
                                                    >
                                                        {selectedUser.bio}
                                                    </motion.p>
                                                )}
                                            </motion.div>

                                            {/* Contact Info Section */}
                                            <motion.div variants={animationVariants.cardSpring}>
                                                <motion.div
                                                    className="space-y-3"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.5 }}
                                                >
                                                    <div className="flex items-center">
                                                        <motion.div
                                                            whileHover={{ rotate: 10, scale: 1.2 }}
                                                            transition={{ type: "spring", stiffness: 500, damping: 10 }}
                                                        >
                                                            <Mail className="h-5 w-5 text-accent-foreground mr-2" />
                                                        </motion.div>
                                                        <h3 className="font-semibold">Contact Information</h3>
                                                    </div>
                                                    <Separator />

                                                    <motion.div
                                                        className="space-y-3 rounded-md p-3 bg-muted/50"
                                                        whileHover={{
                                                            backgroundColor: "rgba(var(--accent), 0.1)",
                                                            transition: { duration: 0.2 }
                                                        }}
                                                    >
                                                        {selectedUser.email && (
                                                            <motion.div
                                                                className="flex items-start gap-2"
                                                                initial={{ x: -20, opacity: 0 }}
                                                                animate={{ x: 0, opacity: 1 }}
                                                                transition={{ delay: 0.6 }}
                                                            >
                                                                <Mail className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                                                                <div>
                                                                    <p className="text-sm font-medium">Email</p>
                                                                    <p className="text-sm text-muted-foreground break-all">{selectedUser.email}</p>
                                                                </div>
                                                            </motion.div>
                                                        )}

                                                        {selectedUser.phone && (
                                                            <motion.div
                                                                className="flex items-start gap-2"
                                                                initial={{ x: -20, opacity: 0 }}
                                                                animate={{ x: 0, opacity: 1 }}
                                                                transition={{ delay: 0.7 }}
                                                            >
                                                                <Phone className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                                                                <div>
                                                                    <p className="text-sm font-medium">Phone</p>
                                                                    <p className="text-sm text-muted-foreground">{selectedUser.phone}</p>
                                                                </div>
                                                            </motion.div>
                                                        )}

                                                        {selectedUser.location && (
                                                            <motion.div
                                                                className="flex items-start gap-2"
                                                                initial={{ x: -20, opacity: 0 }}
                                                                animate={{ x: 0, opacity: 1 }}
                                                                transition={{ delay: 0.8 }}
                                                            >
                                                                <MapPin className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                                                                <div>
                                                                    <p className="text-sm font-medium">Location</p>
                                                                    <p className="text-sm text-muted-foreground">{selectedUser.location}</p>
                                                                </div>
                                                            </motion.div>
                                                        )}

                                                        {(selectedUser.twitter || selectedUser.linkedin) && (
                                                            <motion.div
                                                                className="flex justify-start gap-4 mt-2"
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                transition={{ delay: 0.9 }}
                                                            >
                                                                {selectedUser.twitter && (
                                                                    <motion.a
                                                                        href={`https://twitter.com/${selectedUser.twitter}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        whileHover={{ scale: 1.2 }}
                                                                        whileTap={{ scale: 0.9 }}
                                                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                                                    >
                                                                        <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                                                                    </motion.a>
                                                                )}

                                                                {selectedUser.linkedin && (
                                                                    <motion.a
                                                                        href={`https://linkedin.com/in/${selectedUser.linkedin}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        whileHover={{ scale: 1.2 }}
                                                                        whileTap={{ scale: 0.9 }}
                                                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                                                    >
                                                                        <Linkedin className="h-5 w-5 text-[#0077B5]" />
                                                                    </motion.a>
                                                                )}
                                                            </motion.div>
                                                        )}
                                                    </motion.div>
                                                </motion.div>
                                            </motion.div>

                                            {/* Employee Information Section */}
                                            {selectedUser.employee && (
                                                <motion.div variants={animationVariants.cardSpring} className="space-y-3">
                                                    <div className="flex items-center">
                                                        <motion.div
                                                            whileHover={{ rotate: 10, scale: 1.2 }}
                                                            transition={{ type: "spring", stiffness: 500, damping: 10 }}
                                                        >
                                                            <Briefcase className="h-5 w-5 text-accent-foreground mr-2" />
                                                        </motion.div>
                                                        <h3 className="font-semibold">Employee Information</h3>
                                                    </div>
                                                    <Separator />

                                                    <motion.div
                                                        className="space-y-3 rounded-md p-3 bg-muted/50"
                                                        whileHover={{
                                                            backgroundColor: "rgba(var(--accent), 0.1)",
                                                            transition: { duration: 0.2 }
                                                        }}
                                                    >
                                                        <motion.div
                                                            className="grid grid-cols-2 gap-3"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: 0.7 }}
                                                        >
                                                            <div>
                                                                <p className="text-sm font-medium">Employee ID</p>
                                                                <motion.p
                                                                    className="text-sm text-muted-foreground"
                                                                    whileHover={{ scale: 1.05 }}
                                                                >
                                                                    {selectedUser.employee.employeeId || "N/A"}
                                                                </motion.p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium">Department</p>
                                                                <motion.p
                                                                    className="text-sm text-muted-foreground"
                                                                    whileHover={{ scale: 1.05 }}
                                                                >
                                                                    {selectedUser.employee.department || "N/A"}
                                                                </motion.p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium">Position</p>
                                                                <motion.p
                                                                    className="text-sm text-muted-foreground"
                                                                    whileHover={{ scale: 1.05 }}
                                                                >
                                                                    {selectedUser.employee.position || "N/A"}
                                                                </motion.p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium">Office</p>
                                                                <motion.p
                                                                    className="text-sm text-muted-foreground"
                                                                    whileHover={{ scale: 1.05 }}
                                                                >
                                                                    {selectedUser.employee.office || "N/A"}
                                                                </motion.p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium">Contract Type</p>
                                                                <motion.div
                                                                    whileHover={{ scale: 1.05 }}
                                                                >
                                                                    <Badge variant="outline">
                                                                        {selectedUser.employee.contractType || "N/A"}
                                                                    </Badge>
                                                                </motion.div>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium">Hire Date</p>
                                                                <motion.p
                                                                    className="text-sm text-muted-foreground"
                                                                    whileHover={{ scale: 1.05 }}
                                                                >
                                                                    {formatDate(selectedUser.employee.hireDate) || "N/A"}
                                                                </motion.p>
                                                            </div>
                                                        </motion.div>
                                                    </motion.div>
                                                </motion.div>
                                            )}

                                            {/* Site Information Section */}
                                            {selectedUser.employee?.site && (
                                                <motion.div variants={animationVariants.cardSpring} className="space-y-3">
                                                    <div className="flex items-center">
                                                        <motion.div
                                                            whileHover={{ rotate: 10, scale: 1.2 }}
                                                            transition={{ type: "spring", stiffness: 500, damping: 10 }}
                                                        >
                                                            <Building className="h-5 w-5 text-accent-foreground mr-2" />
                                                        </motion.div>
                                                        <h3 className="font-semibold">Site Information</h3>
                                                    </div>
                                                    <Separator />

                                                    <motion.div
                                                        className="space-y-3 rounded-md p-3 bg-muted/50"
                                                        whileHover={{
                                                            backgroundColor: "rgba(var(--accent), 0.1)",
                                                            transition: { duration: 0.2 }
                                                        }}
                                                    >
                                                        {typeof selectedUser.employee.site === 'object' ? (
                                                            <motion.div
                                                                className="space-y-3"
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                transition={{ delay: 0.8 }}
                                                            >
                                                                <div className="flex gap-3 items-center">
                                                                    <Building2 className="h-8 w-8 text-accent-foreground" />
                                                                    <div>
                                                                        <motion.h4
                                                                            className="text-sm font-bold"
                                                                            whileHover={{ scale: 1.05 }}
                                                                        >
                                                                            {selectedUser.employee.site.name || "Unknown Site"}
                                                                        </motion.h4>
                                                                        {selectedUser.employee.site.location && (
                                                                            <p className="text-xs text-muted-foreground">
                                                                                {selectedUser.employee.site.location}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {selectedUser.employee.site.type && (
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <div>
                                                                            <p className="text-sm font-medium">Site Type</p>
                                                                            <motion.p
                                                                                className="text-sm text-muted-foreground"
                                                                                whileHover={{ scale: 1.05 }}
                                                                            >
                                                                                {selectedUser.employee.site.type}
                                                                            </motion.p>
                                                                        </div>
                                                                        {selectedUser.employee.site.capacity && (
                                                                            <div>
                                                                                <p className="text-sm font-medium">Capacity</p>
                                                                                <motion.p
                                                                                    className="text-sm text-muted-foreground"
                                                                                    whileHover={{ scale: 1.05 }}
                                                                                >
                                                                                    {selectedUser.employee.site.capacity}
                                                                                </motion.p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {selectedUser.employee.site.description && (
                                                                    <div>
                                                                        <p className="text-sm font-medium">Description</p>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            {selectedUser.employee.site.description}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </motion.div>
                                                        ) : (
                                                            <motion.p
                                                                className="text-sm text-muted-foreground"
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                            >
                                                                Site information is not fully loaded. Site ID: {selectedUser.employee.site}
                                                            </motion.p>
                                                        )}
                                                    </motion.div>
                                                </motion.div>
                                            )}

                                            {/* Grade Details Section */}
                                            {selectedUser.grade && (
                                                <motion.div variants={animationVariants.cardSpring} className="space-y-3">
                                                    <div className="flex items-center">
                                                        <motion.div
                                                            whileHover={{ rotate: 10, scale: 1.2 }}
                                                            transition={{ type: "spring", stiffness: 500, damping: 10 }}
                                                        >
                                                            <Award className="h-5 w-5 text-accent-foreground mr-2" />
                                                        </motion.div>
                                                        <h3 className="font-semibold">Grade Information</h3>
                                                    </div>
                                                    <Separator />

                                                    <motion.div
                                                        className="space-y-3 rounded-md p-3 bg-muted/50"
                                                        whileHover={{
                                                            backgroundColor: "rgba(var(--accent), 0.1)",
                                                            transition: { duration: 0.2 }
                                                        }}
                                                        style={{
                                                            borderLeft: `4px solid ${selectedUser.grade.color || "var(--accent)"}`
                                                        }}
                                                    >
                                                        <motion.div
                                                            className="flex flex-col gap-2"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: 0.9 }}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {selectedUser.grade.icon && (
                                                                    <div
                                                                        className="text-xl"
                                                                        style={{ color: selectedUser.grade.color }}
                                                                        dangerouslySetInnerHTML={{ __html: selectedUser.grade.icon }}
                                                                    />
                                                                )}
                                                                <motion.h4
                                                                    className="text-lg font-bold"
                                                                    whileHover={{ scale: 1.05 }}
                                                                >
                                                                    {selectedUser.grade.name}
                                                                </motion.h4>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-2">
                                                                <div>
                                                                    <p className="text-sm font-medium">Cap Level</p>
                                                                    <motion.div
                                                                        className="flex items-center gap-1"
                                                                        whileHover={{ scale: 1.05 }}
                                                                    >
                                                                        {Array.from({ length: selectedUser.grade.cap }).map((_, i) => (
                                                                            <Star
                                                                                key={i}
                                                                                className="h-3 w-3"
                                                                                style={{ color: selectedUser.grade.color }}
                                                                                fill={selectedUser.grade.color}
                                                                            />
                                                                        ))}
                                                                    </motion.div>
                                                                </div>
                                                                {selectedUser.grade.cap && (
                                                                    <div>
                                                                        <p className="text-sm font-medium">Numerical Level</p>
                                                                        <motion.p
                                                                            className="text-sm font-bold"
                                                                            whileHover={{ scale: 1.05 }}
                                                                            style={{ color: selectedUser.grade.color }}
                                                                        >
                                                                            {selectedUser.grade.cap}
                                                                        </motion.p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    </motion.div>
                                                </motion.div>
                                            )}

                                            {/* Account Details */}
                                            <motion.div variants={animationVariants.cardSpring} className="space-y-3">
                                                <div className="flex items-center">
                                                    <motion.div
                                                        whileHover={{ rotate: 10, scale: 1.2 }}
                                                        transition={{ type: "spring", stiffness: 500, damping: 10 }}
                                                    >
                                                        <Shield className="h-5 w-5 text-accent-foreground mr-2" />
                                                    </motion.div>
                                                    <h3 className="font-semibold">Account Details</h3>
                                                </div>
                                                <Separator />

                                                <motion.div
                                                    className="space-y-3 rounded-md p-3 bg-muted/50"
                                                    whileHover={{
                                                        backgroundColor: "rgba(var(--accent), 0.1)",
                                                        transition: { duration: 0.2 }
                                                    }}
                                                >
                                                    <motion.div
                                                        className="grid grid-cols-1 gap-3"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 0.9 }}
                                                    >
                                                        <div>
                                                            <p className="text-sm font-medium">User ID</p>
                                                            <motion.p
                                                                className="text-sm text-muted-foreground"
                                                                whileHover={{ scale: 1.05 }}
                                                            >
                                                                {selectedUser._id}
                                                            </motion.p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">Admin</p>
                                                            <motion.p
                                                                className="text-sm text-muted-foreground"
                                                                whileHover={{ scale: 1.05 }}
                                                            >
                                                                {selectedUser.admin ? "Yes" : "No"}
                                                            </motion.p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">Status</p>
                                                            <motion.div whileHover={{ scale: 1.05 }}>
                                                                <Badge variant={selectedUser.active ? "default" : "destructive"}>
                                                                    {selectedUser.active ? "Active" : "Inactive"}
                                                                </Badge>
                                                            </motion.div>
                                                        </div>
                                                    </motion.div>
                                                </motion.div>
                                            </motion.div>

                                            {/* Admin Actions */}
                                            {user?.admin && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 1.0, duration: 0.3 }}
                                                    className="flex justify-end gap-2 mt-4 pt-4 border-t"
                                                >
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        className="flex items-center gap-2"
                                                        onClick={() => {
                                                            setIsDrawerOpen(false);
                                                            router.push(`/users/${selectedUser._id}`);
                                                        }}
                                                        data-navigation="true"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="flex items-center gap-2"
                                                        onClick={() => {
                                                            setIsDrawerOpen(false);
                                                            setIsDeleteDialogOpen(true);
                                                        }}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        Delete
                                                    </Button>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    </motion.div>
                                </SheetContent>
                            </Sheet>
                        )}
                    </AnimatePresence>
                )}

                {/* Delete Confirmation Dialog */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-destructive" />
                                Delete User
                            </DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete user <span className="font-semibold">{selectedUser?.username}</span>? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="p-4 bg-muted/50 rounded-md">
                            <p className="text-sm text-destructive">
                                Deleting this user will remove all associated data including employee information, permissions, and user history.
                            </p>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                className="gap-2"
                                onClick={() => {
                                    const deleteUser = async () => {
                                        try {
                                            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/users/${selectedUser._id}`, {
                                                method: 'DELETE',
                                                credentials: 'include'
                                            });

                                            if (!response.ok) {
                                                const data = await response.json();
                                                throw new Error(data.error || 'Failed to delete user');
                                            }

                                            toastSuccess(`User ${selectedUser.username} deleted successfully`);
                                            setIsDeleteDialogOpen(false);
                                            fetchUsers(); // Refresh the users list
                                        } catch (error) {
                                            console.error('Error deleting user:', error);
                                            toastError(error.message || 'Failed to delete user');
                                        }
                                    };

                                    deleteUser();
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete User
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Add User Dialog */}
                <AddUserDialog
                    open={isAddUserOpen}
                    onOpenChange={setIsAddUserOpen}
                    onSuccess={() => {
                        fetchUsers();
                        toastSuccess("User added successfully!");
                    }}
                    grades={grades}
                    sites={sites}
                />
            </div>
        </>
    )
}
