"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { Search, Users, Filter, X, UserCircle, Mail, MapPin, Calendar, Twitter, Linkedin, Loader2, Shield, Briefcase, Building2, Building, Clock, Plus, UserPlus } from "lucide-react"
import { useUser } from "@/contexts/UserContext"
import { useRouter } from "next/navigation"
import { AddUserDialog } from "@/components/add-user-dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToastAlert } from "@/contexts/ToastContext"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertCircle, Trash2 } from "lucide-react"


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
    const [grades, setGrades] = useState([]);
    const [sites, setSites] = useState([]);
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);

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
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            setSites(data);
        } catch (err) {
            console.error("Error fetching sites:", err);
            toastError("Error fetching sites. Please try again.");
        }
    }, [toastError]);

    // Authentication effect
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

    // Filter effect
    useEffect(() => {
        filterUsers()
    }, [filterUsers])

    // Show loading state while user context is initializing
    if (user === undefined) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    // Show access denied if not authenticated
    if (user === false) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] p-4">
                <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                <p className="text-muted-foreground text-center">
                    Please log in to view users.
                </p>
            </div>
        )
    }

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

    return (
        <>
            <div className="container mt-8 mx-auto px-4 py-8">
                <div className="flex items-center justify-between">
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
                </div>

                {/* Search and Filter Section */}
                <Card className="mb-8 shadow-lg mt-12">
                    <CardContent className="p-6">
                        <div className="flex flex-col space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, email, or location..."
                                    className="pl-10 border-2"
                                    {...register("searchTerm")}
                                />
                                {searchTerm && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-3 top-1.5 h-6 w-6 text-muted-foreground hover:text-foreground"
                                        onClick={clearSearch}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex items-center gap-2 flex-1">
                                    <Filter className="h-5 w-5 text-muted-foreground" />
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
                                </div>

                                <div className="flex items-center gap-2 flex-1">
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
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Section */}
                <div className="mb-4">
                    <p className="text-muted-foreground">
                        {isLoading ? "Loading users..." : `${filteredUsers.length} users found`}
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-accent-foreground" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredUsers.map((user) => (
                            <Card
                                key={user._id}
                                className="overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                                onClick={() => handleUserClick(user)}
                            >
                                <CardContent className="p-0">
                                    <div className="flex flex-col items-center">
                                        {/* Colored header */}
                                        <div className="bg-accent-foreground w-full h-12"></div>

                                        {/* Avatar */}
                                        <Avatar className="h-16 w-16 border-4 border-background -mt-8 mb-2">
                                            <AvatarImage src={user.photo} alt={user.username} />
                                            <AvatarFallback className="bg-secondary text-secondary-foreground">
                                                {getInitials(user.username)}
                                            </AvatarFallback>
                                        </Avatar>

                                        {/* User info */}
                                        <div className="w-full px-4 pb-4 space-y-2">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-lg truncate">{user.username}</h3>
                                                {user.grade && (
                                                    <Badge variant="outline" className="ml-2 text-accent-foreground">
                                                        {user.grade.name}
                                                    </Badge>
                                                )}
                                            </div>

                                            {user.email && (
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Mail className="h-4 w-4 mr-2" />
                                                    <span className="truncate">{user.email}</span>
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
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {filteredUsers.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-bold mb-2">No users found</h3>
                        <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
                        <Button variant="outline" className="mt-4" onClick={clearSearch}>
                            Clear filters
                        </Button>
                    </div>
                )}
            </div>

            {/* User Detail Drawer */}
            <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <SheetContent className="sm:max-w-md overflow-y-auto">
                    <SheetHeader className="mb-4">
                        <SheetTitle>User Details</SheetTitle>
                        <SheetDescription>Detailed information about the selected user.</SheetDescription>
                    </SheetHeader>

                    {selectedUser && (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center text-center">
                                <Avatar className="h-24 w-24 mb-4">
                                    <AvatarImage src={selectedUser.photo} alt={selectedUser.username} />
                                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xl">
                                        {getInitials(selectedUser.username)}
                                    </AvatarFallback>
                                </Avatar>

                                <h2 className="text-2xl font-bold">{selectedUser.username}</h2>

                                {selectedUser.grade && (
                                    <Badge variant="outline" className="mt-2 text-accent-foreground">
                                        {selectedUser.grade.name}
                                    </Badge>
                                )}

                                {selectedUser.bio && <p className="text-muted-foreground mt-4 text-sm">{selectedUser.bio}</p>}
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Contact Information</h3>

                                <div className="space-y-3">
                                    {selectedUser.email && (
                                        <div className="flex items-center">
                                            <Mail className="h-5 w-5 mr-3 text-accent-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Email</p>
                                                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                                            </div>
                                        </div>
                                    )}

                                    {selectedUser.location && (
                                        <div className="flex items-center">
                                            <MapPin className="h-5 w-5 mr-3 text-accent-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Location</p>
                                                <p className="text-sm text-muted-foreground">{selectedUser.location}</p>
                                            </div>
                                        </div>
                                    )}

                                    {selectedUser.dob && (
                                        <div className="flex items-center">
                                            <Calendar className="h-5 w-5 mr-3 text-accent-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Date of Birth</p>
                                                <p className="text-sm text-muted-foreground">{formatDate(selectedUser.dob)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedUser.employee && (
                                <>
                                    <Separator />
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg">Employment Information</h3>
                                        <div className="space-y-3">
                                            {selectedUser.employee.employeeId && (
                                                <div className="flex items-center">
                                                    <UserCircle className="h-5 w-5 mr-3 text-accent-foreground" />
                                                    <div>
                                                        <p className="text-sm font-medium">Employee ID</p>
                                                        <p className="text-sm text-muted-foreground">{selectedUser.employee.employeeId}</p>
                                                    </div>
                                                </div>
                                            )}
    <div className="flex items-center">
        <Briefcase className="h-5 w-5 mr-3 text-accent-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">Position</p>
                                                    <p className="text-sm text-muted-foreground">{selectedUser.employee.position}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <Building2 className="h-5 w-5 mr-3 text-accent-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">Department</p>
                                                    <p className="text-sm text-muted-foreground">{selectedUser.employee.department}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <Building className="h-5 w-5 mr-3 text-accent-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">Office</p>
                                                    <p className="text-sm text-muted-foreground">{selectedUser.employee.office}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <Clock className="h-5 w-5 mr-3 text-accent-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">Contract Type</p>
                                                    <p className="text-sm text-muted-foreground">{selectedUser.employee.contractType}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <Calendar className="h-5 w-5 mr-3 text-accent-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">Hire Date</p>
                                                    <p className="text-sm text-muted-foreground">{formatDate(selectedUser.employee.hireDate)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {selectedUser.employee?.site && typeof selectedUser.employee.site === "object" && (
                                <>
                                    <Separator />
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg">Site Information</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center">
                                                <MapPin className="h-5 w-5 mr-3 text-accent-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">Site Name</p>
                                                    <p className="text-sm text-muted-foreground">{selectedUser.employee.site.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <Clock className="h-5 w-5 mr-3 text-accent-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">Opening Hours</p>
                                                    <p className="text-sm text-muted-foreground">{selectedUser.employee.site.openHours}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium mb-1">Description</p>
                                                <p className="text-sm text-muted-foreground">{selectedUser.employee.site.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {(selectedUser.urls?.x || selectedUser.urls?.linkedin) && (
                                <>
                                    <Separator />

                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg">Social Media</h3>

                                        <div className="space-y-3">
                                            {selectedUser.urls?.x && (
                                                <div className="flex items-center">
                                                    <Twitter className="h-5 w-5 mr-3 text-accent-foreground" />
                                                    <div>
                                                        <p className="text-sm font-medium">Twitter</p>
                                                        <p className="text-sm text-muted-foreground">@{selectedUser.urls.x}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedUser.urls?.linkedin && (
                                                <div className="flex items-center">
                                                    <Linkedin className="h-5 w-5 mr-3 text-accent-foreground" />
                                                    <div>
                                                        <p className="text-sm font-medium">LinkedIn</p>
                                                        <p className="text-sm text-muted-foreground">in/{selectedUser.urls.linkedin}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            {user.admin && (
                                <>
                                    <Separator />
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg">Account Information</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center">
                                                <UserCircle className="h-5 w-5 mr-3 text-accent-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">User ID</p>
                                                    <p className="text-sm text-muted-foreground font-mono">{selectedUser._id}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div>
                                                                    <DialogTrigger asChild>
                                                                        <Button 
                                                                            variant="secondary" 
                                                                            className="w-full"
                                                                            disabled={selectedUser._id === user._id}
                                                                        >
                                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                                            Delete User
                                                                        </Button>
                                                                    </DialogTrigger>
                                                                </div>
                                                            </TooltipTrigger>
                                                            {selectedUser._id === user._id && (
                                                                <TooltipContent>
                                                                    <p>Cannot delete your own account</p>
                                                                </TooltipContent>
                                                            )}
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle className="flex items-center gap-2">
                                                                <AlertCircle className="h-5 w-5 text-secondary" />
                                                                Delete User
                                                            </DialogTitle>
                                                            <DialogDescription>
                                                                Are you sure you want to delete {selectedUser.username}? This action cannot be undone.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <DialogFooter>
                                                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                                                Cancel
                                                            </Button>
                                                            <Button 
                                                                variant="secondary"
                                                                onClick={async () => {
                                                                    try {
                                                                        const response = await fetch(
                                                                            `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/users/${selectedUser._id}`,
                                                                            {
                                                                                method: "DELETE",
                                                                                credentials: "include",
                                                                            }
                                                                        );
                                                                        const data = await response.json();
                                                                        
                                                                        if (!response.ok) {
                                                                            throw new Error(data.error || "Failed to delete user");
                                                                        }
                                                                        
                                                                        await fetchUsers();
                                                                        toastSuccess(data.message || "User deleted successfully");
                                                                        setIsDeleteDialogOpen(false);
                                                                        setIsDrawerOpen(false);
                                                                    } catch (error) {
                                                                        toastError(error.message || "Failed to delete user");
                                                                        console.error(error);
                                                                    }
                                                                }}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            <AddUserDialog 
                open={isAddUserOpen}
                onOpenChange={setIsAddUserOpen}
                onSuccess={fetchUsers}
                sites={sites}
                grades={grades}
            />
        </>
    )
}
