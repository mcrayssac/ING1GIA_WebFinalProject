"use client"

import { useEffect, useState, useCallback } from "react"
import { useUser } from "@/contexts/UserContext"
import { useToastAlert } from "@/contexts/ToastContext"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    Medal,
    Shield,
    Loader2,
    Plus,
    Target,
    Crown,
    Gift,
    RefreshCw,
    Search,
    Trash2,
    Edit,
    Power,
    PowerOff
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import NoData from "@/components/no-data"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

// Animation variants
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

const formSchema = z.object({
    path: z.string().min(1, "Path is required"),
    points: z.number().min(1, "Points must be at least 1"),
    description: z.string().min(1, "Description is required"),
    isActive: z.boolean().default(true),
})

export default function RewardsPage() {
    const router = useRouter()
    const { user } = useUser()
    const { toastSuccess, toastError } = useToastAlert()
    const [rewards, setRewards] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [refreshing, setRefreshing] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingReward, setEditingReward] = useState(null)

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            path: "",
            points: 1,
            description: "",
            isActive: true,
        },
    })

    const fetchRewards = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/rewards`, {
                credentials: "include",
            })
            if (!response.ok) throw new Error("Failed to fetch rewards")
            const data = await response.json()
            setRewards(data)
        } catch (error) {
            console.error(error)
            toastError("Failed to fetch rewards")
        } finally {
            setIsLoading(false)
        }
    }, [toastError])

    const refreshRewards = useCallback(async () => {
        setRefreshing(true)
        await fetchRewards()
        setRefreshing(false)
    }, [fetchRewards])

    const handleSubmit = async (values) => {
        try {
            const url = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/rewards${editingReward ? `/${editingReward._id}` : ''}`
            const method = editingReward ? 'PATCH' : 'POST'
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(values),
            })

            if (!response.ok) throw new Error('Failed to save reward')
            
            await fetchRewards()
            setDialogOpen(false)
            form.reset()
            setEditingReward(null)
            toastSuccess(`Reward ${editingReward ? 'updated' : 'created'} successfully`)
        } catch (error) {
            console.error(error)
            toastError(`Failed to ${editingReward ? 'update' : 'create'} reward`)
        }
    }

    const deleteReward = async (id) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/rewards/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            })
            if (!response.ok) throw new Error('Failed to delete reward')
            await fetchRewards()
            toastSuccess('Reward deleted successfully')
        } catch (error) {
            console.error(error)
            toastError('Failed to delete reward')
        }
    }

    const toggleRewardStatus = async (reward) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/rewards/${reward._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ isActive: !reward.isActive }),
            })
            if (!response.ok) throw new Error('Failed to toggle reward status')
            await fetchRewards()
            toastSuccess(`Reward ${reward.isActive ? 'disabled' : 'enabled'} successfully`)
        } catch (error) {
            console.error(error)
            toastError('Failed to toggle reward status')
        }
    }

    const editReward = (reward) => {
        setEditingReward(reward)
        form.reset({
            path: reward.path,
            points: reward.points,
            description: reward.description,
            isActive: reward.isActive,
        })
        setDialogOpen(true)
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
            fetchRewards()
        }
    }, [user, router, fetchRewards])

    // Filter rewards based on search term
    const filteredRewards = rewards.filter(reward =>
        reward.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reward.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Loading state
    if (user === undefined) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    // Access denied states
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
        <div className="p-4 space-y-6">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerAnimation}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold">Reward Actions</h1>
                    <p className="text-muted-foreground">Manage reward points for user actions</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={refreshRewards} variant="outline" disabled={refreshing}>
                        {refreshing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                        Refresh
                    </Button>
                    <Button onClick={() => {
                        setEditingReward(null)
                        form.reset({
                            path: "",
                            points: 1,
                            description: "",
                            isActive: true,
                        })
                        setDialogOpen(true)
                    }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Reward
                    </Button>
                </div>
            </motion.div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerAnimation}
                className="space-y-4"
            >
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search rewards..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <ScrollArea className="h-[calc(100vh-250px)]">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <Card key={i}>
                                    <CardContent className="p-6">
                                        <div className="flex justify-between">
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-[250px]" />
                                                <Skeleton className="h-4 w-[200px]" />
                                            </div>
                                            <Skeleton className="h-6 w-24" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <motion.div variants={containerAnimation} className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {filteredRewards.map((reward) => (
                                    <motion.div
                                        key={reward._id}
                                        variants={itemAnimation}
                                        layout
                                        initial="hidden"
                                        animate="visible"
                                        exit={{ opacity: 0, scale: 0.8 }}
                                    >
                                        <Card>
                                            <CardContent className="p-6">
                                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <Medal className="h-5 w-5 text-yellow-500" />
                                                            <h3 className="font-medium">/{reward.path}</h3>
                                                            <Badge variant={reward.isActive ? "success" : "secondary"}>
                                                                {reward.isActive ? (
                                                                    <Crown className="h-3 w-3 mr-1" />
                                                                ) : (
                                                                    <Target className="h-3 w-3 mr-1" />
                                                                )}
                                                                {reward.isActive ? "Active" : "Inactive"}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-muted-foreground">{reward.description}</p>
                                                        <div className="flex items-center gap-2">
                                                            <Gift className="h-4 w-4 text-blue-500" />
                                                            <span className="font-medium">{reward.points} points</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="icon"
                                                            onClick={() => toggleRewardStatus(reward)}
                                                            className={reward.isActive ? "bg-primary-foreground hover:bg-red-500 text-red-500 hover:text-primary-foreground" : "bg-primary-foreground hover:bg-green-500 text-green-500 hover:text-primary-foreground"}
                                                        >
                                                            {reward.isActive ? (
                                                                <PowerOff className="h-4 w-4" />
                                                            ) : (
                                                                <Power className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            onClick={() => editReward(reward)}
                                                            className="text-blue-500 bg-primary-foreground hover:bg-blue-500 hover:text-primary-foreground"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            onClick={() => deleteReward(reward._id)}
                                                            className="text-red-500 bg-primary-foreground hover:bg-red-500 hover:text-primary-foreground"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            
                            {filteredRewards.length === 0 && (
                                <NoData message="No rewards found" />
                            )}
                        </motion.div>
                    )}
                </ScrollArea>
            </motion.div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingReward ? 'Edit' : 'Create'} Reward Action</DialogTitle>
                        <DialogDescription>
                            {editingReward
                                ? "Update the reward action details below."
                                : "Add a new reward action for user activities."}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="path"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Path</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., login" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="points"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Points</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                {...field}
                                                onChange={e => field.onChange(parseInt(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Description of the reward" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2">
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    data-action="close-overlay"
                                                />
                                            </FormControl>
                                            <FormLabel>Active</FormLabel>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button variant="outline" type="button" onClick={() => setDialogOpen(false)} data-action="close-overlay">
                                    Cancel
                                </Button>
                                <Button type="submit" data-action="close-overlay">
                                    {editingReward ? 'Update' : 'Create'} Reward
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
