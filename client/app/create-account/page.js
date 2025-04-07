"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { User, Lock, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export default function CreateAccountPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get("email");

    console.log("📦 Données envoyées :", { username, password, email });

    try {
      const response = await fetch(`${API_URL}/api/auth/create-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email }),
      });

      if (response.ok) {
        setMessage("Account created successfully! Redirecting...");
        setError("");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        const data = await response.json();
        setError(data.message || "Account creation failed");
      }
    } catch (err) {
      console.error("💥 Erreur front :", err);
      setError("An unexpected error occurred.");
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-lg">
        <Card>
          <CardContent className="p-8 space-y-6">
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold">Create your account</h1>
              <p className="text-muted-foreground text-sm">
                Choose a username and password to activate your account.
              </p>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-5">
              {/* Username */}
              <div className="grid gap-2">
                <div className="flex items-center space-x-2">
                  <User />
                  <Label htmlFor="username" className="font-semibold">Username</Label>
                </div>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <div className="flex items-center space-x-2">
                  <Lock />
                  <Label htmlFor="password" className="font-semibold">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Error & Success Messages */}
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {message && <p className="text-green-500 text-sm">{message}</p>}

              {/* Submit Button */}
              <Button type="submit" className="w-full">
                <div className="flex items-center justify-center space-x-2">
                  <Rocket />
                  <span>Create Account</span>
                </div>
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground mt-4">
          Already registered?{" "}
          <a href="/login" className="underline underline-offset-4 hover:text-primary">
            Log in here
          </a>
        </div>
      </div>
    </div>
  );
}
