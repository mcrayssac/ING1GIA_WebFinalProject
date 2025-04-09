"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Orbit, Satellite, CheckCircle2, XCircle, Loader2, ArrowLeft } from "lucide-react"
import { useToastAlert } from "@/contexts/ToastContext"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL
const imageUrl =
    "https://easy-peasy.ai/cdn-cgi/image/quality=80,format=auto,width=700/https://media.easy-peasy.ai/642363ad-20f9-434b-a6de-27c7f1d7cb9d/dc2a524f-f617-4f0f-b07e-a627df8b8781.png"

export default function VerifySignupPage() {
    const { toastSuccess, toastError } = useToastAlert()
    const [status, setStatus] = useState("loading") // loading | success | error
    const [progress, setProgress] = useState(0)
    const router = useRouter()

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get("token")

        if (!token) {
            setStatus("error")
            toastError("Invalid verification token", { description: "Please check your email link and try again." })
            return
        }

        // Animate progress bar
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(progressInterval)
                    return prev
                }
                return prev + 10
            })
        }, 500)

        // Set a timeout to prevent premature "error" state
        const timeout = setTimeout(() => {
            if (status === "loading") {
                toastError("Verification is taking longer than expected", { description: "Please wait a moment..." })
            }
        }, 10000) // 10 seconds timeout

        fetch(`${API_URL}/api/auth/verify-token?token=${token}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to verify token")
                }
                return res.json()
            })
            .then((data) => {
                clearTimeout(timeout) // Clear the timeout if the response is received
                clearInterval(progressInterval) // Clear the progress interval
                setProgress(100) // Complete the progress bar

                if (data.success) {
                    setStatus("success")
                    toastSuccess("Email verified successfully!", { description: "Redirecting to account creation..." })
                    setTimeout(() => {
                        router.push(`/create-account?email=${data.email}`)
                    }, 2000)
                } else {
                    setStatus("error")
                    toastError("Verification failed", { description: "The token may be expired or invalid." })
                }
            })
            .catch((err) => {
                console.error("Error verifying token:", err)
                clearTimeout(timeout) // Clear the timeout if an error occurs
                clearInterval(progressInterval) // Clear the progress interval
                setProgress(100) // Complete the progress bar
                setStatus("error")
                toastError("Verification error", { description: "An unexpected error occurred. Please try again." })
            })

        return () => {
            clearTimeout(timeout) // Cleanup timeout on component unmount
            clearInterval(progressInterval) // Cleanup interval on component unmount
        }
    }, [router, toastSuccess, toastError])

    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-3xl lg:max-w-4xl">
                <div className="flex flex-col gap-6">
                    <Card className="overflow-hidden">
                        <CardContent className="grid p-0 md:grid-cols-2">
                            <div className="p-6 md:p-8">
                                <CardHeader className="px-0 pt-0">
                                    <div className="flex items-center justify-center space-x-2 mb-2">
                                        <Orbit className="animate-spin" style={{ animationDuration: "10s" }} />
                                        <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
                                        <Satellite className="animate-bounce" style={{ animationDuration: "2s" }} />
                                    </div>
                                    <CardDescription className="text-center">
                                        {status === "loading"
                                            ? "We're verifying your email address..."
                                            : status === "success"
                                                ? "Your email has been successfully verified!"
                                                : "We couldn't verify your email address."}
                                    </CardDescription>
                                </CardHeader>

                                <div className="flex flex-col items-center justify-center space-y-8 mt-8">
                                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-muted">
                                        {status === "loading" ? (
                                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                        ) : status === "success" ? (
                                            <CheckCircle2 className="h-12 w-12 text-green-500" />
                                        ) : (
                                            <XCircle className="h-12 w-12 text-red-500" />
                                        )}
                                    </div>

                                    {status === "loading" && (
                                        <div className="w-full space-y-2">
                                            <Progress value={progress} className="h-2 w-full" />
                                            <p className="text-center text-sm text-muted-foreground">Verifying your credentials...</p>
                                        </div>
                                    )}

                                    {status === "success" && (
                                        <div className="text-center space-y-2">
                                            <p className="text-green-500 font-medium">Verification successful!</p>
                                            <p className="text-sm text-muted-foreground">
                                                You'll be redirected to create your account in a moment...
                                            </p>
                                        </div>
                                    )}

                                    {status === "error" && (
                                        <div className="text-center space-y-2">
                                            <p className="text-red-500 font-medium">Verification failed</p>
                                            <p className="text-sm text-muted-foreground">
                                                The verification link may be expired or invalid. Please try again.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <CardFooter className="flex justify-center mt-8 px-0 pb-0">
                                    {status === "error" && (
                                        <Button onClick={() => router.push("/signup")} variant="secondary" className="w-full">
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Back to Signup
                                        </Button>
                                    )}
                                </CardFooter>
                            </div>

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
                        Having trouble? <a href="#">Contact support</a> for assistance.
                    </div>
                </div>
            </div>
        </div>
    )
}
