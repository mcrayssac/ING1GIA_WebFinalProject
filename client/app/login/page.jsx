"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { IdCard, RectangleEllipsis, Orbit, Satellite, Rocket } from "lucide-react"
import { useUser } from "@/contexts/UserContext"
import { useToastAlert } from "@/contexts/ToastContext"
import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const imageUrl =
    "https://easy-peasy.ai/cdn-cgi/image/quality=80,format=auto,width=700/https://media.easy-peasy.ai/642363ad-20f9-434b-a6de-27c7f1d7cb9d/dc2a524f-f617-4f0f-b07e-a627df8b8781.png"
const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL

export default function LoginPage() {
    const { fetchUser, user } = useUser()
    const { toastSuccess, toastError } = useToastAlert()
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [formFocused, setFormFocused] = useState(false)
    const [launchSequence, setLaunchSequence] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (user) {
            router.push("/")
        }
    }, [user, router])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setLaunchSequence(true)

        try {
            const credentials = btoa(`${username}:${password}`)
            const response = await fetch(`${API_URL}/api/users/login`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${credentials}`,
                },
            })

            await response.json()
            toastSuccess("Logged in successfully")

            setTimeout(async () => {
                await fetchUser();
            }, 2000)
        } catch (err) {
            console.error(err)
            toastError("Invalid credentials")
            setLaunchSequence(false)
        } finally {
            setTimeout(() => {
                setIsLoading(false)
            }, 3000)
        }
    }

    return (
        <div className="relative min-h-svh">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-secondary/5" />
            <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm md:max-w-3xl lg:max-w-4xl">
                    <div className="flex flex-col gap-6">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                            <Card className="overflow-hidden border-primary/20">
                                <CardContent className="grid p-0 md:grid-cols-2">
                                    <form
                                        onSubmit={handleSubmit}
                                        className="p-6 md:p-8"
                                        onFocus={() => setFormFocused(true)}
                                        onBlur={() => setFormFocused(false)}
                                    >
                                        <div className="flex flex-col gap-12">
                                            <motion.div
                                                className="flex flex-col items-center text-center"
                                                animate={{
                                                    scale: launchSequence ? [1, 1.05, 1] : 1,
                                                }}
                                                transition={{ duration: 0.5 }}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <motion.div
                                                        animate={{
                                                            rotate: 360,
                                                        }}
                                                        transition={{
                                                            duration: 10,
                                                            repeat: Number.POSITIVE_INFINITY,
                                                            ease: "linear",
                                                        }}
                                                    >
                                                        <Orbit className="h-6 w-6" />
                                                    </motion.div>
                                                    <motion.h1
                                                        className="text-2xl font-bold"
                                                        animate={{
                                                            textShadow: formFocused
                                                                ? [
                                                                    "0 0 0px rgba(var(--primary), 0)",
                                                                    "0 0 10px rgba(var(--primary), 0.5)",
                                                                    "0 0 0px rgba(var(--primary), 0)",
                                                                ]
                                                                : "none",
                                                        }}
                                                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                                                    >
                                                        Welcome back
                                                    </motion.h1>
                                                    <motion.div
                                                        animate={{
                                                            y: [0, -8, 0],
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Number.POSITIVE_INFINITY,
                                                            ease: "easeInOut",
                                                        }}
                                                    >
                                                        <Satellite className="h-6 w-6" />
                                                    </motion.div>
                                                </div>
                                                <p className="text-balance text-muted-foreground">Continue your mission by logging in!</p>
                                            </motion.div>

                                            <motion.div
                                                className="grid gap-2"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.2, duration: 0.4 }}
                                            >
                                                <Label htmlFor="username" className="font-semibold">
                                                    Space ID
                                                </Label>
                                                <div className="relative">
                                                    <motion.div
                                                        whileTap={{ scale: 0.98 }}
                                                        whileFocus={{ borderColor: "hsl(var(--primary))" }}
                                                    >
                                                        <Input
                                                            id="username"
                                                            type="text"
                                                            placeholder="astronaut"
                                                            className="pr-10"
                                                            required
                                                            value={username}
                                                            onChange={(e) => setUsername(e.target.value)}
                                                        />
                                                    </motion.div>
                                                    <motion.div
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                                    >
                                                        <IdCard className="h-5 w-5" />
                                                    </motion.div>
                                                </div>
                                            </motion.div>

                                            <motion.div
                                                className="grid gap-2"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3, duration: 0.4 }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="password" className="font-semibold">
                                                        Password
                                                    </Label>
                                                    <Link
                                                        href="/forgot-password"
                                                        className="ml-4 text-sm text-muted-foreground hover:text-accent-foreground hover:underline underline-offset-4 relative z-50"
                                                    >
                                                        Forgot your password?
                                                    </Link>
                                                </div>
                                                <div className="relative">
                                                    <motion.div
                                                        whileTap={{ scale: 0.98 }}
                                                        whileFocus={{ borderColor: "hsl(var(--primary))" }}
                                                    >
                                                        <Input
                                                            id="password"
                                                            type="password"
                                                            className="pr-10"
                                                            required
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                        />
                                                    </motion.div>
                                                    <motion.div
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                                    >
                                                        <RectangleEllipsis className="h-5 w-5" />
                                                    </motion.div>
                                                </div>
                                            </motion.div>

                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4, duration: 0.4 }}
                                            >
                                                <motion.div
                                                    whileHover={!isLoading ? { scale: 1.03, y: -2 } : {}}
                                                    whileTap={!isLoading ? { scale: 0.97 } : {}}
                                                >
                                                    <Button
                                                        type="submit"
                                                        className="w-full relative overflow-hidden group"
                                                        disabled={isLoading}
                                                        data-action="close-overlay"
                                                    >
                                                        {/* Button background animation */}
                                                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-80 group-hover:opacity-100 transition-opacity" />

                                                        {/* Launch animation */}
                                                        {launchSequence && (
                                                            <motion.div
                                                                className="absolute inset-0 bg-gradient-to-t from-primary via-secondary to-transparent"
                                                                initial={{ y: "100%" }}
                                                                animate={{ y: "-100%" }}
                                                                transition={{ duration: 1.5, ease: "easeIn" }}
                                                            />
                                                        )}

                                                        <div className="relative flex items-center justify-center">
                                                            <motion.div
                                                                animate={launchSequence ? { y: -100, opacity: 0 } : { y: 0, opacity: 1 }}
                                                                transition={{ duration: 0.5 }}
                                                            >
                                                                <Rocket className="mr-2 h-5 w-5" />
                                                            </motion.div>
                                                            <motion.span
                                                                className="line-clamp-1"
                                                                animate={launchSequence ? { y: -100, opacity: 0 } : { y: 0, opacity: 1 }}
                                                                transition={{ duration: 0.5 }}
                                                            >
                                                                {isLoading ? "Launching..." : "Launch the mission astronaut!"}
                                                            </motion.span>

                                                            {launchSequence && (
                                                                <motion.div
                                                                    className="absolute inset-0 flex items-center justify-center font-mono font-bold text-white"
                                                                    initial={{ opacity: 0, scale: 2 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    transition={{ duration: 0.3 }}
                                                                >
                                                                    <CountdownAnimation />
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    </Button>
                                                </motion.div>
                                            </motion.div>

                                            <motion.div
                                                className="text-center text-sm"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.5, duration: 0.4 }}
                                            >
                                                Don&apos;t have an account?{" "}
                                                <Link
                                                    href="/signup"
                                                    className="text-muted-foreground hover:text-accent-foreground hover:underline underline-offset-4 relative z-50"
                                                >
                                                    Sign up
                                                </Link>
                                            </motion.div>
                                        </div>
                                    </form>
                                    <div className="relative hidden md:block">
                                        <motion.div
                                            className="absolute inset-0 overflow-hidden"
                                            initial={{ scale: 1.1, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 0.8 }}
                                        >
                                            <img
                                                src={imageUrl}
                                                alt="Space background"
                                                className="absolute inset-0 h-full w-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-primary via-transparent via-opacity-0 to-transparent" />
                                        </motion.div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                        <motion.div
                            className="text-balance text-center text-xs text-muted-foreground"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.4 }}
                        >
                            <Link 
                                href="/terms" 
                                className="text-primary hover:text-primary/80 underline underline-offset-4 mr-1 relative z-50"
                            >
                                Terms of Service
                            </Link>
                            and
                            <Link 
                                href="/privacy" 
                                className="text-primary hover:text-primary/80 underline underline-offset-4 ml-1 relative z-50"
                            >
                                Privacy Policy
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function CountdownAnimation() {
    const [count, setCount] = useState(3)

    useEffect(() => {
        if (count <= 0) return

        const timer = setTimeout(() => {
            setCount(count - 1)
        }, 400)

        return () => clearTimeout(timer)
    }, [count])

    return (
        <motion.div
            key={count}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            {count > 0 ? count : <Rocket className="h-6 w-6 animate-bounce" />}
        </motion.div>
    )
}
