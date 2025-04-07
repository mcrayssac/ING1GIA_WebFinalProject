"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { IdCard, RectangleEllipsis, Orbit, Satellite, Rocket } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import Alert from "@/components/alert";

const imageUrl = "https://easy-peasy.ai/cdn-cgi/image/quality=80,format=auto,width=700/https://media.easy-peasy.ai/642363ad-20f9-434b-a6de-27c7f1d7cb9d/dc2a524f-f617-4f0f-b07e-a627df8b8781.png";
const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export default function LoginPage() {
    // Local state for username, password, and error handling
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    // On mount, check if there is a token and verify it.
    useEffect(() => {
        const token = Cookies.get("token");
        if (token) {
            fetch(`${API_URL}/api/users/verify`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            })
                .then((response) => {
                    if (response.ok) {
                        // Redirect the user to home if the token is valid
                        router.push("/");
                    } else {
                        // Remove the token from cookies if it is invalid
                        Cookies.remove("token");
                    }
                })
                .catch((err) => {
                    console.error("Error verifying token:", err);
                    Cookies.remove("token");
                });
        }
    }, [router]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            // Basic Auth header value by base64-encoding the credentials
            const credentials = btoa(`${username}:${password}`);
            const response = await fetch(`${API_URL}/api/users/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Basic ${credentials}`
                }
            });

            if (!response.ok) {
                throw new Error("Invalid credentials");
            }

            const data = await response.json();

            if (data.token) {
                // Store the token in cookies (expires in 1 day)
                Cookies.set("token", data.token, { expires: 1 });
                // Redirect the user to home after successful login
                window.location.href = "/";
            } else {
                throw new Error("Token not returned");
            }
        } catch (err) {
            console.error(err);
            setError("Login failed. Please check your credentials.");
        }
    };

    return (
        (<div>
            {error && <Alert type="error" message={error} onClose={() => setError("")} />}
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
                                            <p className="text-balance text-accent-foreground">Continue your mission by logging in !</p>
                                        </div>
                                        <div className="grid gap-2">
                                            <a className="truncate font-semibold" htmlFor="username">Space ID</a>
                                            <label className="input input-primary flex items-center gap-2 w-full">
                                                <input id="username" type="email" placeholder="astronaut@spacey.com" className="grow w-full placeholder-oklch-p" required value={username} onChange={(e) => setUsername(e.target.value)} style={{ color: "oklch(var(--p))" }} />
                                                <IdCard className="w-6 h-6" style={{ color: "oklch(var(--p))" }} />
                                            </label>
                                        </div>
                                        <div className="grid gap-2">
                                            <div className="flex items-center">
                                                <a className="truncate font-semibold" htmlFor="username">Password</a>
                                                <a href="#" className="ml-auto text-sm underline-offset-2 hover:underline text-accent-foreground">Forgot your password?</a>
                                            </div>
                                            <label className="input input-primary flex items-center gap-2 w-full">
                                                <input id="password" type="password" className="grow placeholder-oklch-p" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ color: "oklch(var(--p))" }} />
                                                <RectangleEllipsis className="w-6 h-6" style={{ color: "oklch(var(--p))" }} />
                                            </label>
                                        </div>
                                        <button type="submit" className="btn btn-secondary btn-outline w-full">
                                            <Rocket />
                                            Launch the mission astronaut !
                                        </button>
                                        <div className="text-center text-sm">Don&apos;t have an account?{" "}
                                            <a href="#" className="underline underline-offset-4">Sign up</a>
                                        </div>
                                    </div>
                                </form>
                                <div className="relative hidden bg-muted md:block">
                                    <img src={imageUrl} alt="Space background" className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale" />
                                </div>
                            </CardContent>
                        </Card>
                        <div
                            className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
                            By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "} and <a href="#">Privacy Policy</a>.
                        </div>
                    </div>
                </div>
            </div>
        </div>
        )
    );
}
