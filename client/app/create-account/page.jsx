"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Orbit, Satellite, Rocket, Lock, User } from "lucide-react"
import { useToastAlert } from "@/contexts/ToastContext"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const imageUrl =
    "https://easy-peasy.ai/cdn-cgi/image/quality=80,format=auto,width=700/https://media.easy-peasy.ai/642363ad-20f9-434b-a6de-27c7f1d7cb9d/dc2a524f-f617-4f0f-b07e-a627df8b8781.png"
const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL

export default function CreateAccountPage() {
    const { toastSuccess, toastError } = useToastAlert()
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleCreateAccount = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        const urlParams = new URLSearchParams(window.location.search)
        const email = urlParams.get("email")

        try {
            const response = await fetch(`${API_URL}/api/auth/create-user`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, email }),
            })

            if (response.ok) {
                toastSuccess("Account created successfully!", { description: "Redirecting to login..." })
                setTimeout(() => router.push("/login"), 2000)
            } else {
                const data = await response.json()
                toastError("Account creation failed", { description: data.message || "Please try again" })
            }
        } catch (err) {
            toastError("An unexpected error occurred", { description: "Please try again later" })
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
                                <form onSubmit={handleCreateAccount} className="p-6 md:p-8">
                                    <div className="flex flex-col gap-12">
                                        <div className="flex flex-col items-center text-center">
                                            <div className="flex items-center space-x-2">
                                                <Orbit className="animate-spin" style={{ animationDuration: "10s" }} />
                                                <h1 className="text-2xl font-bold">Activate your account</h1>
                                                <Satellite className="animate-bounce" style={{ animationDuration: "2s" }} />
                                            </div>
                                            <p className="text-balance text-muted-foreground">
                                                Choose a username and password to complete your registration
                                            </p>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="username" className="font-semibold">
                                                Username
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="username"
                                                    type="text"
                                                    placeholder="astronaut42"
                                                    className="pr-10"
                                                    required
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                />
                                                <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="password" className="font-semibold">
                                                Password
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    placeholder="Create a secure password"
                                                    className="pr-10"
                                                    required
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                />
                                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Password must be at least 8 characters long and include a number and special character
                                            </p>
                                        </div>

                                        <Button type="submit" className="w-full" variant="secondary" disabled={isLoading}>
                                            <Rocket className="mr-2 h-5 w-5" />
                                            <span className="line-clamp-1">
                                                {isLoading ? "Preparing for liftoff..." : "Launch your account!"}
                                            </span>
                                        </Button>

                                        <div className="text-center text-sm">
                                            Already have an account?{" "}
                                            <button
                                                onClick={() => {
                                                    router.push("/login")
                                                }}
                                                className="text-muted-foreground hover:text-accent-foreground hover:underline underline-offset-4"
                                            >
                                                Log in
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
                                </div>
                            </CardContent>
                        </Card>
                        <div className="text-balance text-center text-xs text-muted-foreground [&_a]:text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-primary">
                            By creating an account, you agree to our <a href="#">Terms of Service</a> and{" "}
                            <a href="#">Privacy Policy</a>.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
