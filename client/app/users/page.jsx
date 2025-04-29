"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Search, Users, Filter, X, UserCircle, Mail, MapPin, Calendar, Twitter, Linkedin, Loader2 } from "lucide-react"
import { useUser } from "@/contexts/UserContext"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToastAlert } from "@/contexts/ToastContext"

export default function UserSearchPage() {
    const { user } = useUser()
    const router = useRouter()
    const { toastError } = useToastAlert()

    useEffect(() => {
        if (!user) {
            router.push('/')
        }
    }, [user, router])

    // Show nothing while checking user status and redirecting
    if (!user) return null;
    const [users, setUsers] = useState([])
    const [filteredUsers, setFilteredUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [sortOption, setSortOption] = useState("username")
    const [filterRole, setFilterRole] = useState("all")

    const { register, watch, reset } = useForm({
        defaultValues: {
            searchTerm: "",
        },
    })

    const searchTerm = watch("searchTerm")

    // Fetch users on mount
    useEffect(() => {
        fetchUsers()
    }, [])

    // Filter users when search term, sort option, or filter role changes
    useEffect(() => {
        if (!users.length) return

        let result = [...users]

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            result = result.filter(
                (user) =>
                    user.username.toLowerCase().includes(term) ||
                    (user.email && user.email.toLowerCase().includes(term)) ||
                    (user.location && user.location.toLowerCase().includes(term)),
            )
        }

        // Apply role filter
        if (filterRole !== "all") {
            result = result.filter((user) => user.role === filterRole)
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
    }, [searchTerm, users, sortOption, filterRole])

    const fetchUsers = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/users`, {
                method: "GET",
                credentials: "include",
            })

            const data = await response.json()
            setUsers(data)
            setFilteredUsers(data)
        } catch (err) {
            console.error("Error fetching users:", err)
            toastError("Error fetching users. Please try again.")
            route.push("/login")
        } finally {
            setIsLoading(false)
        }
    }

    const handleUserClick = (user) => {
        setSelectedUser(user)
        setIsDrawerOpen(true)
    }

    const clearSearch = () => {
        reset()
        setFilterRole("all")
        setSortOption("username")
    }

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "N/A"
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    // Get initials for avatar fallback
    const getInitials = (name) => {
        return name
            .split(" ")
            .map((part) => part.charAt(0).toUpperCase())
            .join("")
    }

    return (
        <>
            <div className="container mt-8 mx-auto px-4 py-8">
                <div className="flex items-center space-x-4">
                    <Users className="w-8 h-8" />
                    <h1 className="text-4xl font-black font-mono text-start">Users</h1>
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
                                    <Select value={filterRole} onValueChange={setFilterRole}>
                                        <SelectTrigger className="border-2">
                                            <SelectValue placeholder="Filter by role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Roles</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="user">User</SelectItem>
                                            <SelectItem value="moderator">Moderator</SelectItem>
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
                                                {user.role && (
                                                    <Badge variant={user.role === "admin" ? "destructive" : "secondary"} className="ml-2">
                                                        {user.role}
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

                                {selectedUser.role && (
                                    <Badge variant={selectedUser.role === "admin" ? "destructive" : "secondary"} className="mt-2">
                                        {selectedUser.role}
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

                                    {selectedUser.createdAt && (
                                        <div className="flex items-center">
                                            <Calendar className="h-5 w-5 mr-3 text-accent-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Member Since</p>
                                                <p className="text-sm text-muted-foreground">{formatDate(selectedUser.createdAt)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </>
    )
}
