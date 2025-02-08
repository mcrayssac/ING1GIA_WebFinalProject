"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Cookies from "js-cookie";

import { IdCard, RectangleEllipsis, Orbit, Satellite, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
    (<div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden">
            <CardContent className="grid p-0 md:grid-cols-2">
              <form onSubmit={handleSubmit} className="p-6 md:p-8">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center space-x-2">
                      <Orbit />
                      <h1 className="text-2xl font-bold">Welcome back</h1>
                      <Satellite />
                    </div>
                    <p className="text-balance text-muted-foreground">Continue your mission by logging in !</p>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center space-x-2">
                      <IdCard />
                      <Label className="truncate font-semibold" htmlFor="username">Space ID</Label>
                    </div>
                    <Input id="username" type="email" placeholder="astronaut@spacey.com" required value={username} onChange={(e) => setUsername(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <div className="flex items-center space-x-2">
                        <RectangleEllipsis />
                        <Label  className="truncate font-semibold" htmlFor="password">Password</Label>
                      </div>
                      <a href="#" className="ml-auto text-sm underline-offset-2 hover:underline">Forgot your password?</a>
                    </div>
                    <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  {error && <p className="text-red-500">{error}</p>}
                  <Button type="submit" className="w-full">
                    <div className="flex items-center space-x-2">
                      <Rocket />
                      <span>Launch the mission astronaut !</span>
                    </div>
                  </Button>
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
    </div>)
  );
}
