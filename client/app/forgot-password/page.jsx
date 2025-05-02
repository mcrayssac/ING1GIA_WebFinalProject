"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Orbit, Satellite, Mail, ArrowLeft, SendHorizonal, Search, Rocket, SpaceIcon as Planet } from "lucide-react"
import { useToastAlert } from "@/contexts/ToastContext"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const imageUrl =
    "https://easy-peasy.ai/cdn-cgi/image/quality=80,format=auto,width=700/https://media.easy-peasy.ai/642363ad-20f9-434b-a6de-27c7f1d7cb9d/dc2a524f-f617-4f0f-b07e-a627df8b8781.png"
const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL

export default function ForgotPasswordPage() {
    const { toastSuccess, toastError } = useToastAlert()
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [animationStage, setAnimationStage] = useState(0)
    const [searchRadius, setSearchRadius] = useState(0)
    const router = useRouter()

    // Animation effect
    useEffect(() => {
        if (isLoading) {
            const interval = setInterval(() => {
                setAnimationStage((prev) => (prev + 1) % 4)
            }, 800)

            const radiusInterval = setInterval(() => {
                setSearchRadius((prev) => {
                    if (prev >= 100) return 0
                    return prev + 5
                })
            }, 200)

            return () => {
                clearInterval(interval)
                clearInterval(radiusInterval)
            }
        }
    }, [isLoading])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email }),
            })

            // Simulate a longer process to show the animation
            await new Promise((resolve) => setTimeout(resolve, 3000))

            if (response.ok) {
                toastSuccess("Recovery signal sent!", { description: "Check your email for the recovery instructions" })
                router.push("/login")
            } else {
                const data = await response.json()
                toastError("Signal transmission failed", { description: data.message || "Please try again" })
            }
        } catch (error) {
            console.error(error)
            toastError("Communication error", { description: "Unable to establish connection. Please try again later" })
        } finally {
            setIsLoading(false)
        }
    }

    const getAnimationMessage = () => {
        const messages = [
            "Scanning the galaxy...",
            "Locating your account...",
            "Preparing recovery signal...",
            "Transmitting reset link...",
        ]
        return messages[animationStage]
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
                                                <h1 className="text-2xl font-bold">Lost in Space?</h1>
                                                <Satellite className="animate-bounce" style={{ animationDuration: "2s" }} />
                                            </div>
                                            <p className="text-balance text-muted-foreground mt-2">
                                                Don't worry, astronaut! We'll help you recover your access codes.
                                            </p>
                                        </div>

                                        {!isLoading ? (
                                            <>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="email" className="font-semibold">
                                                        Communication Channel (Email)
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

                                                <Button 
                                                    type="submit" 
                                                    className="w-full" 
                                                    variant="secondary"
                                                    data-action="close-overlay"
                                                >
                                                    <SendHorizonal className="mr-2 h-5 w-5" />
                                                    <span className="line-clamp-1">Send Recovery Signal</span>
                                                </Button>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-8 space-y-8">
                                                <div className="relative">
                                                    <div className="w-32 h-32 flex items-center justify-center">
                                                        <Planet className="h-12 w-12 text-primary animate-pulse" />
                                                        <div
                                                            className="absolute inset-0 border-2 border-dashed rounded-full border-primary animate-spin"
                                                            style={{ animationDuration: "10s" }}
                                                        ></div>
                                                        <div
                                                            className="absolute rounded-full border border-primary opacity-70"
                                                            style={{
                                                                width: `${searchRadius}%`,
                                                                height: `${searchRadius}%`,
                                                                transition: "all 0.2s ease-out",
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <Rocket
                                                        className="absolute h-6 w-6 text-secondary-foreground"
                                                        style={{
                                                            top: "50%",
                                                            left: "50%",
                                                            transform: `rotate(${animationStage * 90}deg) translate(60px, -50%)`,
                                                            transformOrigin: "left center",
                                                            transition: "transform 0.8s ease-in-out",
                                                        }}
                                                    />
                                                </div>
                                                <div className="text-center space-y-2">
                                                    <p className="text-lg font-medium">{getAnimationMessage()}</p>
                                                    <p className="text-sm text-muted-foreground">Please wait while we process your request</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="text-center text-sm">
                                            <button
                                                onClick={() => router.push("/login")}
                                                type="button"
                                                disabled={isLoading}
                                                className="flex items-center justify-center mx-auto text-muted-foreground hover:text-accent-foreground hover:underline underline-offset-4 disabled:opacity-50"
                                            >
                                                <ArrowLeft className="h-4 w-4 mr-1" />
                                                Return to command center
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
                                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/70 flex items-center justify-center">
                                        <div className="p-8 text-white max-w-xs text-center">
                                            <Search className="h-16 w-16 mx-auto mb-4 opacity-90" />
                                            <h3 className="text-xl font-bold mb-2">Password Recovery Mission</h3>
                                            <p className="text-sm opacity-90">
                                                We'll send a secure transmission to your registered communication channel with instructions to
                                                regain access to your space station.
                                            </p>
                                            <div className="mt-6 flex justify-center">
                                                <div className="flex space-x-1">
                                                    {[0, 1, 2].map((dot) => (
                                                        <div
                                                            key={dot}
                                                            className={`h-2 w-2 rounded-full ${animationStage === dot ? "bg-white" : "bg-white/30"}`}
                                                        ></div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <div className="text-balance text-center text-xs text-muted-foreground [&_a]:text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-primary">
                            Lost in deep space? <a href="#">Contact mission control</a> for emergency assistance.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
