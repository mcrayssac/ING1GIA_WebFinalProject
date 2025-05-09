"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BadgeIcon as IdCard, Orbit, Satellite, Rocket, Mail } from "lucide-react"
import { useToastAlert } from "@/contexts/ToastContext"
import { motion } from "framer-motion"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const imageUrl =
    "https://easy-peasy.ai/cdn-cgi/image/quality=80,format=auto,width=700/https://media.easy-peasy.ai/642363ad-20f9-434b-a6de-27c7f1d7cb9d/dc2a524f-f617-4f0f-b07e-a627df8b8781.png"
const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL

export default function SignupPage() {
    const { toastSuccess, toastError } = useToastAlert()
    const [email, setEmail] = useState("")
    const [employeeId, setEmployeeId] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSignup = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch(`${API_URL}/api/auth/request-signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ employeeId, email }),
            })

            await response.json()
            toastSuccess("Confirmation link sent!", { description: "Check your email for the confirmation link!" })
            router.push("/login")
        } catch (err) {
            console.error(err)
            toastError("Error sending confirmation link", { description: err.message })
        } finally {
            setIsLoading(false)
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
                                    <form onSubmit={handleSignup} className="p-6 md:p-8">
                                        <div className="flex flex-col gap-12">
                                            <motion.div
                                                className="flex flex-col items-center text-center"
                                                animate={{
                                                    scale: isLoading ? [1, 1.05, 1] : 1,
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
                                                    <motion.h1 className="text-2xl font-bold">
                                                        Join the mission
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
                                                <p className="text-balance text-muted-foreground">Start your space journey by signing up!</p>
                                            </motion.div>

                                            <motion.div
                                                className="grid gap-2"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.2, duration: 0.4 }}
                                            >
                                                <Label htmlFor="employeeId" className="font-semibold">
                                                    Employee ID
                                                </Label>
                                                <div className="relative">
                                                    <motion.div
                                                        whileTap={{ scale: 0.98 }}
                                                        whileFocus={{ borderColor: "hsl(var(--primary))" }}
                                                    >
                                                        <Input
                                                            id="employeeId"
                                                            type="text"
                                                            placeholder="EMP123456"
                                                            className="pr-10"
                                                            required
                                                            value={employeeId}
                                                            onChange={(e) => setEmployeeId(e.target.value)}
                                                        />
                                                    </motion.div>
                                                    <IdCard className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                </div>
                                            </motion.div>

                                            <motion.div
                                                className="grid gap-2"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3, duration: 0.4 }}
                                            >
                                                <Label htmlFor="email" className="font-semibold">
                                                    Email
                                                </Label>
                                                <div className="relative">
                                                    <motion.div
                                                        whileTap={{ scale: 0.98 }}
                                                        whileFocus={{ borderColor: "hsl(var(--primary))" }}
                                                    >
                                                        <Input
                                                            id="email"
                                                            type="email"
                                                            placeholder="astronaut@spacey.com"
                                                            className="pr-10"
                                                            required
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                        />
                                                    </motion.div>
                                                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
                                                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-80 group-hover:opacity-100 transition-opacity" />
                                                        <div className="relative flex items-center justify-center">
                                                            <Rocket className="mr-2 h-5 w-5" />
                                                            <span className="line-clamp-1">
                                                                {isLoading ? "Preparing launch..." : "Begin your space journey!"}
                                                            </span>
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
                                                Already have an account?{" "}
                                                <Link
                                                    href="/login"
                                                    className="text-muted-foreground hover:text-accent-foreground hover:underline underline-offset-4 relative z-50"
                                                >
                                                    Log in
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
                                                src={imageUrl || "/placeholder.svg"}
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
                            By clicking continue, you agree to our{" "}
                            <a href="/terms" className="text-primary hover:text-primary/80 underline underline-offset-4 relative z-50">
                                Terms of Service
                            </a>{" "}
                            and{" "}
                            <a href="/privacy" className="text-primary hover:text-primary/80 underline underline-offset-4 relative z-50">
                                Privacy Policy
                            </a>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
