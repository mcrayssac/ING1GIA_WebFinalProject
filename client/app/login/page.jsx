"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BadgeIcon as IdCard, RectangleEllipsis, Orbit, Satellite, Rocket } from "lucide-react"
import { useUser } from "@/contexts/UserContext"
import { useToastAlert } from "@/contexts/ToastContext"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const imageUrl =
    "https://easy-peasy.ai/cdn-cgi/image/quality=80,format=auto,width=700/https://media.easy-peasy.ai/642363ad-20f9-434b-a6de-27c7f1d7cb9d/dc2a524f-f617-4f0f-b07e-a627df8b8781.png"
const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL

export default function LoginPage() {
    const { fetchUser, user } = useUser();
    const { toastSuccess, toastError } = useToastAlert();

    // Local state for username, password, and error handling
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    // On mount, check if user is not empty
    useEffect(() => {
        if (user) {
            router.push("/")
        }
    }, [user, router])

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Basic Auth header value by base64-encoding the credentials
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
            await fetchUser()
            toastSuccess("Logged in successfully")
            router.push("/")
        } catch (err) {
            console.error(err)
            toastError("Invalid credentials")
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
                                    <div className="flex flex-col gap-12">
                                        <div className="flex flex-col items-center text-center">
                                            <div className="flex items-center space-x-2">
                                                <Orbit className="animate-spin" style={{ animationDuration: "10s" }} />
                                                <h1 className="text-2xl font-bold">Welcome back</h1>
                                                <Satellite className="animate-bounce" style={{ animationDuration: "2s" }} />
                                            </div>
                                            <p className="text-balance text-muted-foreground">Continue your mission by logging in!</p>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="username" className="font-semibold">
                                                Space ID
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="username"
                                                    type="text"
                                                    placeholder="astronaut"
                                                    className="pr-10"
                                                    required
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                />
                                                <IdCard className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="password" className="font-semibold">
                                                    Password
                                                </Label>
                                                <a
                                                    href="/forgot-password"
                                                    className="ml-4 text-sm text-muted-foreground hover:text-accent-foreground hover:underline underline-offset-4 line-clamp-1"
                                                >
                                                    Forgot your password?
                                                </a>
                                            </div>
                                            <div className="relative">
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    className="pr-10"
                                                    required
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                />
                                                <RectangleEllipsis className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            </div>
                                        </div>

                                        <Button type="submit" className="w-full" variant="secondary" disabled={isLoading}>
                                            <Rocket className="mr-2 h-5 w-5" />
                                            <span className="line-clamp-1">
                                                {isLoading ? "Launching..." : "Launch the mission astronaut!"}
                                            </span>
                                        </Button>

                                        <div className="text-center text-sm">
                                            Don&apos;t have an account?{" "}
                                            <button onClick={ () => {router.push("/signup")} } className="text-muted-foreground hover:text-accent-foreground hover:underline underline-offset-4">
                                                Sign up
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
                            By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                            .
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
