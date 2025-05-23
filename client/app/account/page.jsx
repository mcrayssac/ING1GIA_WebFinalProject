"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Loader2, CalendarIcon, PenIcon as UserPen, KeyRound, UserRoundPen, CircleUser } from "lucide-react"
import { useUser } from "@/contexts/UserContext"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useToastAlert } from "@/contexts/ToastContext"

// Simplified animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { 
            staggerChildren: 0.1,
            duration: 0.4
        } 
    }
}

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
        y: 0, 
        opacity: 1,
        transition: { type: "spring", stiffness: 100 }
    }
}

const cardVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.4 }
    },
    hover: {
        y: -5,
        transition: { duration: 0.2 }
    }
}

const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 }
}

// Wrap Card with motion component
const MotionCard = motion(Card);

export default function AccountPage() {
    const { fetchUser } = useUser()
    const { toastSuccess, toastError } = useToastAlert();

    const [isLoading, setIsLoading] = useState(false)
    const [isPasswordLoading, setIsPasswordLoading] = useState(false)
    const [isImageUploading, setIsImageUploading] = useState(false)
    const [avatarSrc, setAvatarSrc] = useState("")
    const router = useRouter();

    // React Hook Form setup
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        mode: "onChange",
    })

    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        watch: watchPassword,
        reset: resetPassword,
        formState: { errors: passwordErrors },
    } = useForm({
        mode: "onChange",
    })

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/users/infos`, {
            method: "GET",
            credentials: "include",
        })
            .then((response) => {
                if (!response.ok) throw new Error("Failed to fetch user info")
                return response.json()
            })
            .then((data) => {
                setValue("_id", data._id)
                setValue("username", data.username)
                setValue("email", data.email || "")
                setValue("bio", data.bio || "")
                if (data.urls && data.urls.x) setValue("urls.x", data.urls.x || "")
                if (data.urls && data.urls.linkedin) setValue("urls.linkedin", data.urls.linkedin || "")
                setValue("dob", new Date(data.dob) || "")
                setValue("location", data.location || "")
                setIsImageUploading(true)
                setAvatarSrc(data.photo || "")
                setIsImageUploading(false)
            })
            .catch((err) => {
                console.error("Error fetching user info:", err)
                toastError("Failed to fetch user info", { description: err.message })
                router.push("/login")
            })
    }, [])

    function onSubmit(data) {
        setIsLoading(true)
        data.photo = avatarSrc
        console.log("Submitting data:", data)
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/users/infos/${data._id}`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to update user")
                return res.json()
            })
            .then((result) => {
                setIsLoading(false)
                toastSuccess("User updated", { description: result.message })
                fetchUser()
            })
            .catch((err) => {
                console.error("Error updating user:", err)
                toastError("Failed to update user", { description: err.message })
                setIsLoading(false)
            })
    }

    function onPasswordSubmit(data) {
        setIsPasswordLoading(true)

        if (data.newPassword !== data.confirmPassword) {
            toastError("Passwords do not match")
            setIsPasswordLoading(false)
            return
        }

        fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/users/password`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                oldPassword: data.currentPassword,
                newPassword: data.newPassword,
            }),
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to update password")
                return res.json()
            })
            .then((result) => {
                setIsPasswordLoading(false)
                toastSuccess("Password updated", { description: result.message })
                resetPassword()
            })
            .catch((err) => {
                console.error("Error updating password:", err)
                toastError("Failed to update password", { description: err.message })
                setIsPasswordLoading(false)
            })
    }

    function handleImageUpload(event) {
        const file = event.target.files && event.target.files[0]
        if (!file) return

        const maxSize = 2 * 1024 * 1024
        if (file.size > maxSize) {
            alert("File is too large. Maximum allowed size is 2MB.")
            return
        }

        setIsImageUploading(true)
        const reader = new FileReader()
        reader.onload = (e) => {
            setAvatarSrc(e.target.result)
            setIsImageUploading(false)
        }
        reader.readAsDataURL(file)
    }

    const formatDate = (date) => {
        if (!date) return ""
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    return (
        <>
            <motion.div
                className="container mt-8 mx-auto px-4 py-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div 
                    className="flex items-center space-x-4" 
                    variants={itemVariants}
                >
                    <UserPen className="w-8 h-8" />
                    <h1 className="text-4xl font-black font-mono text-start">Account</h1>
                </motion.div>
                
                <motion.div 
                    className="flex flex-col md:flex-row gap-4 md:gap-8 mt-12" 
                    variants={containerVariants}
                >
                    <MotionCard 
                        className="w-full md:w-1/3 shadow-xl text-primary-content" 
                        variants={cardVariants}
                        whileHover="hover"
                    >
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <CircleUser className="w-5 h-5" />
                                <CardTitle className="text-accent-foreground">Your avatar</CardTitle>
                            </div>
                            <CardDescription>This is your profile picture.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4 justify-center">
                            <motion.div 
                                className="relative"
                                whileHover={{ scale: 1.05 }}
                            >
                                <Avatar className="h-full w-full max-w-[200px]">
                                    <AvatarImage src={avatarSrc} alt="Profile" />
                                    <AvatarFallback className="bg-secondary min-h-[100px] min-w-[100px] text-lg font-bold">
                                        {(watch("username") || "")
                                            .split(" ")
                                            .map((name) => name.charAt(0).toUpperCase())
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>
                                {isImageUploading && (
                                    <motion.div 
                                        className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                                    </motion.div>
                                )}
                            </motion.div>
                            <div className="flex flex-col gap-2">
                                <p className="text-sm text-muted-foreground">Recommended size: 200x200px</p>
                                <Separator className="my-2" />
                                <p className="text-sm text-muted-foreground">Supported formats: JPG, PNG, GIF</p>
                                <p className="text-sm text-muted-foreground">Max size: 2MB</p>
                            </div>
                            <div className="flex flex-wrap gap-2 justify-center w-full">
                                <motion.div
                                    whileHover="hover"
                                    whileTap="tap"
                                    variants={buttonVariants}
                                >
                                    <Label
                                        htmlFor="avatar-upload"
                                        className="cursor-pointer rounded-md bg-accent-foreground px-3 py-2 text-sm font-medium text-primary font-bold shadow hover:bg-accent items-center flex justify-center min-w-[100px]"
                                    >
                                        Change
                                    </Label>
                                </motion.div>
                                <Input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                                <motion.div
                                    whileHover="hover"
                                    whileTap="tap"
                                    variants={buttonVariants}
                                >
                                    <Button
                                        variant="secondary"
                                        className="hover:bg-accent hover:text-secondary font-bold min-w-[100px]"
                                        onClick={() => {
                                            setAvatarSrc("")
                                        }}
                                        disabled={isLoading}
                                    >
                                        Remove
                                    </Button>
                                </motion.div>
                            </div>
                        </CardContent>
                    </MotionCard>

                    <MotionCard 
                        className="flex-1" 
                        variants={cardVariants}
                        whileHover="hover"
                    >
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <UserRoundPen className="w-5 h-5" />
                                    <CardTitle className="text-accent-foreground">Profile informations</CardTitle>
                                </div>
                                <CardDescription>Update your profile informations.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Username */}
                                <motion.div 
                                    className="grid gap-3" 
                                    variants={itemVariants}
                                >
                                    <Label htmlFor="username" className="font-bold">
                                        Username
                                    </Label>
                                    <Input
                                        id="username"
                                        placeholder="Username"
                                        className="border-2"
                                        {...register("username", {
                                            required: "Username is required",
                                            minLength: {
                                                value: 2,
                                                message: "Username must be at least 2 characters.",
                                            },
                                            maxLength: {
                                                value: 30,
                                                message: "Username must not be longer than 30 characters.",
                                            },
                                        })}
                                    />
                                    {errors.username && (
                                        <p className="text-sm text-destructive">
                                            {errors.username.message}
                                        </p>
                                    )}
                                </motion.div>

                                {/* Email */}
                                <motion.div 
                                    className="grid gap-3" 
                                    variants={itemVariants}
                                >
                                    <Label htmlFor="email" className="font-bold">
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Email"
                                        className="border-2"
                                        {...register("email", {
                                            pattern: {
                                                value: /^\S+@\S+\.\S+$/,
                                                message: "This is not a valid email",
                                            },
                                        })}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </motion.div>

                                {/* Bio */}
                                <motion.div 
                                    className="grid gap-3" 
                                    variants={itemVariants}
                                >
                                    <Label htmlFor="bio" className="font-bold">
                                        Bio
                                    </Label>
                                    <Textarea
                                        id="bio"
                                        placeholder="Tell us about yourself"
                                        className="border-2"
                                        {...register("bio", {
                                            maxLength: {
                                                value: 160,
                                                message: "Bio must not be longer than 160 characters.",
                                            },
                                        })}
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        {watch("bio") ? watch("bio").length : 0}/160 characters
                                    </p>
                                    {errors.bio && (
                                        <p className="text-sm text-destructive">
                                            {errors.bio.message}
                                        </p>
                                    )}
                                </motion.div>

                                {/* Date of Birth */}
                                <motion.div 
                                    className="grid gap-3"
                                    variants={itemVariants}
                                >
                                    <Label htmlFor="dob" className="font-bold">
                                        Date of Birth
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                                                <Button
                                                    id="dob"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal border-2 border-accent-foreground",
                                                        !watch("dob") && "text-muted-foreground",
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {watch("dob") ? formatDate(watch("dob")) : <span>Pick a date</span>}
                                                </Button>
                                            </motion.div>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                            >
                                                <Calendar
                                                    mode="single"
                                                    selected={watch("dob")}
                                                    onSelect={(date) => setValue("dob", date)}
                                                    initialFocus
                                                />
                                            </motion.div>
                                        </PopoverContent>
                                    </Popover>
                                </motion.div>

                                {/* Location */}
                                <motion.div 
                                    className="grid gap-3"
                                    variants={itemVariants}
                                >
                                    <Label htmlFor="location" className="font-bold">
                                        Location
                                    </Label>
                                    <Input 
                                        id="location" 
                                        placeholder="Location" 
                                        className="border-2"
                                        {...register("location")} 
                                    />
                                </motion.div>

                                {/* X and LinkedIn */}
                                <div className="grid grid-cols-2 gap-4">
                                    <motion.div 
                                        className="grid gap-3"
                                        variants={itemVariants}
                                    >
                                        <Label htmlFor="x" className="font-bold">
                                            X
                                        </Label>
                                        <div className="flex">
                                            <span className="flex items-center rounded-l-md border border-2 border-r-0 bg-muted px-3 text-muted-foreground font-bold">
                                                @
                                            </span>
                                            <Input 
                                                id="x" 
                                                placeholder="x" 
                                                className="rounded-l-none border-2"
                                                {...register("urls.x")} 
                                            />
                                        </div>
                                    </motion.div>

                                    <motion.div 
                                        className="grid gap-3"
                                        variants={itemVariants}
                                    >
                                        <Label htmlFor="linkedin" className="font-bold">
                                            LinkedIn
                                        </Label>
                                        <div className="flex">
                                            <span className="flex items-center rounded-l-md border border-2 border-r-0 bg-muted px-3 text-muted-foreground font-bold">
                                                in/
                                            </span>
                                            <Input 
                                                id="linkedin" 
                                                placeholder="linkedin" 
                                                className="rounded-l-none border-2"
                                                {...register("urls.linkedin")}
                                            />
                                        </div>
                                    </motion.div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end">
                                <motion.div 
                                    variants={buttonVariants} 
                                    whileHover="hover" 
                                    whileTap="tap"
                                >
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        variant="secondary"
                                        className="hover:bg-accent hover:text-secondary font-bold"
                                    >
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Changes
                                    </Button>
                                </motion.div>
                            </CardFooter>
                        </form>
                    </MotionCard>
                </motion.div>

                {/* Password Update Card */}
                <motion.div className="mt-4" variants={itemVariants}>
                    <MotionCard 
                        className="w-full shadow-xl" 
                        variants={cardVariants}
                        whileHover="hover"
                    >
                        <form onSubmit={handleSubmitPassword(onPasswordSubmit)}>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <KeyRound className="w-5 h-5" />
                                    <CardTitle className="text-accent-foreground">Update Password</CardTitle>
                                </div>
                                <CardDescription>Change your account password.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Current Password */}
                                <motion.div 
                                    className="grid gap-3"
                                    variants={itemVariants}
                                >
                                    <Label htmlFor="currentPassword" className="font-bold">
                                        Current Password
                                    </Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        placeholder="Enter your current password"
                                        className="border-2"
                                        {...registerPassword("currentPassword", {
                                            required: "Current password is required",
                                        })}
                                    />
                                    {passwordErrors.currentPassword && (
                                        <p className="text-sm text-destructive">
                                            {passwordErrors.currentPassword.message}
                                        </p>
                                    )}
                                </motion.div>

                                {/* New Password */}
                                <motion.div 
                                    className="grid gap-3"
                                    variants={itemVariants}
                                >
                                    <Label htmlFor="newPassword" className="font-bold">
                                        New Password
                                    </Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        placeholder="Enter your new password"
                                        className="border-2"
                                        {...registerPassword("newPassword", {
                                            required: "New password is required",
                                            minLength: {
                                                value: 8,
                                                message: "Password must be at least 8 characters",
                                            },
                                            pattern: {
                                                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                                message:
                                                    "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
                                            },
                                        })}
                                    />
                                    {passwordErrors.newPassword && (
                                        <p className="text-sm text-destructive">
                                            {passwordErrors.newPassword.message}
                                        </p>
                                    )}
                                </motion.div>

                                {/* Confirm New Password */}
                                <motion.div 
                                    className="grid gap-3"
                                    variants={itemVariants}
                                >
                                    <Label htmlFor="confirmPassword" className="font-bold">
                                        Confirm New Password
                                    </Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Confirm your new password"
                                        className="border-2"
                                        {...registerPassword("confirmPassword", {
                                            required: "Please confirm your new password",
                                            validate: (value) => value === watchPassword("newPassword") || "Passwords do not match",
                                        })}
                                    />
                                    {passwordErrors.confirmPassword && (
                                        <p className="text-sm text-destructive">
                                            {passwordErrors.confirmPassword.message}
                                        </p>
                                    )}
                                </motion.div>

                                <motion.div 
                                    className="space-y-2"
                                    variants={itemVariants}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <p className="text-sm text-muted-foreground">Password requirements:</p>
                                    <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                                        <li>At least 8 characters</li>
                                        <li>At least one uppercase letter</li>
                                        <li>At least one lowercase letter</li>
                                        <li>At least one number</li>
                                        <li>At least one special character (@$!%*?&)</li>
                                    </ul>
                                </motion.div>
                            </CardContent>
                            <CardFooter className="flex justify-end">
                                <motion.div 
                                    variants={buttonVariants} 
                                    whileHover="hover" 
                                    whileTap="tap"
                                >
                                    <Button
                                        type="submit"
                                        disabled={isPasswordLoading}
                                        variant="secondary"
                                        className="hover:bg-accent hover:text-secondary font-bold"
                                    >
                                        {isPasswordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Update Password
                                    </Button>
                                </motion.div>
                            </CardFooter>
                        </form>
                    </MotionCard>
                </motion.div>
            </motion.div>
        </>
    );
}

