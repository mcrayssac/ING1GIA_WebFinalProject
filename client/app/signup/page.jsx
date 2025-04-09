"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BadgeIcon as IdCard, Orbit, Satellite, Rocket, Mail } from "lucide-react"
import { useToastAlert } from "@/contexts/ToastContext"

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
        <div>
            <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
                <div className="w-full max-w-sm md:max-w-3xl lg:max-w-4xl">
                    <div className="flex flex-col gap-6">
                        <Card className="overflow-hidden">
                            <CardContent className="grid p-0 md:grid-cols-2">
                                <form onSubmit={handleSignup} className="p-6 md:p-8">
                                    <div className="flex flex-col gap-12">
                                        <div className="flex flex-col items-center text-center">
                                            <div className="flex items-center space-x-2">
                                                <Orbit className="animate-spin" style={{ animationDuration: "10s" }} />
                                                <h1 className="text-2xl font-bold">Join the mission</h1>
                                                <Satellite className="animate-bounce" style={{ animationDuration: "2s" }} />
                                            </div>
                                            <p className="text-balance text-muted-foreground">Start your space journey by signing up!</p>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="employeeId" className="font-semibold">
                                                Employee ID
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="employeeId"
                                                    type="text"
                                                    placeholder="EMP123456"
                                                    className="pr-10"
                                                    required
                                                    value={employeeId}
                                                    onChange={(e) => setEmployeeId(e.target.value)}
                                                />
                                                <IdCard className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="email" className="font-semibold">
                                                Email
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="astronaut@spacey.com"
                                                    className="pr-10"
                                                    required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                />
                                                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            </div>
                                        </div>

                                        <Button type="submit" className="w-full" variant="secondary" disabled={isLoading}>
                                            <Rocket className="mr-2 h-5 w-5" />
                                            <span className="line-clamp-1">
                                                {isLoading ? "Preparing launch..." : "Begin your space journey!"}
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
                            By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                            .
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
