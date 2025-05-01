"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Orbit, Satellite, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react"
import { useToastAlert } from "@/contexts/ToastContext"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const imageUrl =
    "https://easy-peasy.ai/cdn-cgi/image/quality=80,format=auto,width=700/https://media.easy-peasy.ai/642363ad-20f9-434b-a6de-27c7f1d7cb9d/dc2a524f-f617-4f0f-b07e-a627df8b8781.png"
const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL

export default function ResetPasswordPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toastSuccess, toastError } = useToastAlert()

    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState(0)
    const [passwordChecks, setPasswordChecks] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
    })

    const token = searchParams.get("token")

    useEffect(() => {
        if (!token) {
            toastError("Invalid reset link", { description: "The password reset link is invalid or has expired" })
            router.push("/login")
        }
    }, [token, router, toastError])

    useEffect(() => {
        // Check password strength
        const checks = {
            length: newPassword.length >= 8,
            uppercase: /[A-Z]/.test(newPassword),
            lowercase: /[a-z]/.test(newPassword),
            number: /[0-9]/.test(newPassword),
            special: /[^A-Za-z0-9]/.test(newPassword),
        }

        setPasswordChecks(checks)

        // Calculate strength percentage
        const passedChecks = Object.values(checks).filter(Boolean).length
        setPasswordStrength((passedChecks / 5) * 100)
    }, [newPassword])

    const getStrengthColor = () => {
        if (passwordStrength <= 20) return "bg-red-500"
        if (passwordStrength <= 40) return "bg-orange-500"
        if (passwordStrength <= 60) return "bg-yellow-500"
        if (passwordStrength <= 80) return "bg-blue-500"
        return "bg-green-500"
    }

    const getStrengthText = () => {
        if (passwordStrength <= 20) return "Very Weak"
        if (passwordStrength <= 40) return "Weak"
        if (passwordStrength <= 60) return "Medium"
        if (passwordStrength <= 80) return "Strong"
        return "Very Strong"
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (newPassword !== confirmPassword) {
            toastError("Passwords do not match", { description: "Please ensure both passwords are identical" })
            return
        }

        if (newPassword.length < 8) {
            toastError("Password too short", { description: "Password must be at least 8 characters long" })
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    token,
                    newPassword,
                }),
            })

            const data = await response.json()

            if (response.ok) {
                toastSuccess("Password reset successful!", { description: "You can now log in with your new password" })
                router.push("/login")
            } else {
                toastError("Password reset failed", { description: data.message || "Please try again" })
            }
        } catch (error) {
            console.error(error)
            toastError("An error occurred", { description: "Please try again later" })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div>
            <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
                <div className="w-full max-w-sm md:max-w-3xl lg:max-w-4xl">
                    <div className="flex flex-col gap-6">
                        <Card className="overflow-hidden">
                            <CardContent className="grid p-0 md:grid-cols-2">
                                <form onSubmit={handleSubmit} className="p-6 md:p-8">
                                    <div className="flex flex-col gap-10">
                                        <div className="flex flex-col items-center text-center">
                                            <div className="flex items-center space-x-2">
                                                <Orbit className="animate-spin" style={{ animationDuration: "10s" }} />
                                                <h1 className="text-2xl font-bold">Reset Password</h1>
                                                <Satellite className="animate-bounce" style={{ animationDuration: "2s" }} />
                                            </div>
                                            <p className="text-balance text-muted-foreground mt-2">
                                                Create a new secure password for your space mission
                                            </p>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Password Strength Indicator */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <Label className="text-sm font-medium">Password Strength</Label>
                                                    <span className="text-xs font-medium">{getStrengthText()}</span>
                                                </div>
                                                <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/20">
                                                    <div
                                                        className={`h-full transition-all ${getStrengthColor()}`}
                                                        style={{ width: `${passwordStrength}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* New Password */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="newPassword" className="font-semibold">
                                                    New Password
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="newPassword"
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="Enter your new password"
                                                        className="pr-10"
                                                        required
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                    />
                                                    <button
                                                        type="button"
                                                        data-action="close-overlay"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                    >
                                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Confirm Password */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="confirmPassword" className="font-semibold">
                                                    Confirm Password
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="confirmPassword"
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        placeholder="Confirm your new password"
                                                        className="pr-10"
                                                        required
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                    />
                                                    <button
                                                        type="button"
                                                        data-action="close-overlay"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                    >
                                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Password Requirements */}
                                            <div className="space-y-2 bg-muted p-3 rounded-md">
                                                <p className="text-sm font-medium flex items-center text-primary">
                                                    <ShieldCheck className="h-4 w-4 mr-2 text-primary" />
                                                    Password Requirements
                                                </p>
                                                <ul className="space-y-1 text-xs">
                                                    <li className="flex items-center">
                                                        <CheckCircle2
                                                            className={`h-3 w-3 mr-2 ${passwordChecks.length ? "text-green-500" : "text-muted-foreground"}`}
                                                        />
                                                        <span className={passwordChecks.length ? "text-green-600" : "text-muted-foreground"}>
                                                            At least 8 characters
                                                        </span>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <CheckCircle2
                                                            className={`h-3 w-3 mr-2 ${passwordChecks.uppercase ? "text-green-500" : "text-muted-foreground"}`}
                                                        />
                                                        <span className={passwordChecks.uppercase ? "text-green-600" : "text-muted-foreground"}>
                                                            At least one uppercase letter
                                                        </span>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <CheckCircle2
                                                            className={`h-3 w-3 mr-2 ${passwordChecks.lowercase ? "text-green-500" : "text-muted-foreground"}`}
                                                        />
                                                        <span className={passwordChecks.lowercase ? "text-green-600" : "text-muted-foreground"}>
                                                            At least one lowercase letter
                                                        </span>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <CheckCircle2
                                                            className={`h-3 w-3 mr-2 ${passwordChecks.number ? "text-green-500" : "text-muted-foreground"}`}
                                                        />
                                                        <span className={passwordChecks.number ? "text-green-600" : "text-muted-foreground"}>
                                                            At least one number
                                                        </span>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <CheckCircle2
                                                            className={`h-3 w-3 mr-2 ${passwordChecks.special ? "text-green-500" : "text-muted-foreground"}`}
                                                        />
                                                        <span className={passwordChecks.special ? "text-green-600" : "text-muted-foreground"}>
                                                            At least one special character
                                                        </span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>

                                        <Button 
                                            type="submit" 
                                            className="w-full" 
                                            variant="secondary" 
                                            disabled={isLoading}
                                            data-action="close-overlay"
                                        >
                                            <KeyRound className="mr-2 h-5 w-5" />
                                            <span className="line-clamp-1">{isLoading ? "Securing your account..." : "Reset Password"}</span>
                                        </Button>

                                        <div className="text-center text-sm">
                                            <button
                                                onClick={() => {
                                                    router.push("/login")
                                                }}
                                                type="button"
                                                className="flex items-center justify-center mx-auto text-muted-foreground hover:text-accent-foreground hover:underline underline-offset-4"
                                            >
                                                <ArrowLeft className="h-4 w-4 mr-1" />
                                                Back to login
                                            </button>
                                        </div>
                                    </div>
                                </form>
                                <div className="relative hidden bg-muted md:block">
                                    <img
                                        src={imageUrl || "/placeholder.svg"}
                                        alt="Space background"
                                        className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/50 flex items-center justify-center">
                                        <div className="p-8 text-white max-w-xs text-center">
                                            <Lock className="h-16 w-16 mx-auto mb-4 opacity-90" />
                                            <h3 className="text-xl font-bold mb-2">Secure Your Mission</h3>
                                            <p className="text-sm opacity-90">
                                                A strong password is your first line of defense against cosmic threats. Choose wisely,
                                                astronaut!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <div className="text-balance text-center text-xs text-muted-foreground [&_a]:text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-primary">
                            Need help? <a href="#">Contact our support team</a> for assistance.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
