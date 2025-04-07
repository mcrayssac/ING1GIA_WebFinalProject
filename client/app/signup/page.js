"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { IdCard, Orbit, Satellite, Rocket, Mail, Briefcase, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const imageUrl = "https://easy-peasy.ai/cdn-cgi/image/quality=80,format=auto,width=700/https://media.easy-peasy.ai/642363ad-20f9-434b-a6de-27c7f1d7cb9d/dc2a524f-f617-4f0f-b07e-a627df8b8781.png";
const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/auth/request-signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, email, department, position }),
      });

      const data = await response.json();

if (!response.ok) {
  throw new Error(data.message || "Invalid Employee ID or Email");
}

setMessage(data.message || "Check your email for the confirmation link!");

    } catch (err) {
      setError(err.message || "Signup failed. Please verify your information.");

    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden">
            <CardContent className="grid p-0 md:grid-cols-2">
              <form onSubmit={handleSignup} className="p-6 md:p-8">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center space-x-2">
                      <Orbit />
                      <h1 className="text-2xl font-bold">Verify Your Identity</h1>
                      <Satellite />
                    </div>
                    <p className="text-balance text-muted-foreground">
                      Enter your Employee ID and email to receive a confirmation link.
                    </p>
                  </div>

                  {/* Employee ID */}
                  <div className="grid gap-2">
                    <div className="flex items-center space-x-2">
                      <IdCard />
                      <Label className="truncate font-semibold" htmlFor="employeeId">Employee ID</Label>
                    </div>
                    <Input id="employeeId" type="text" placeholder="EMP123456" required 
                      value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />
                  </div>

                  {/* Email */}
                  <div className="grid gap-2">
                    <div className="flex items-center space-x-2">
                      <Mail />
                      <Label className="truncate font-semibold" htmlFor="email">Email</Label>
                    </div>
                    <Input id="email" type="email" placeholder="astronaut@spacey.com" required 
                      value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>

                  {/* Department */}
                  <div className="grid gap-2">
                    <div className="flex items-center space-x-2">
                      <Building />
                      <Label className="truncate font-semibold" htmlFor="department">Department</Label>
                    </div>
                    <Input id="department" type="text" placeholder="Engineering, HR, Finance..." required 
                      value={department} onChange={(e) => setDepartment(e.target.value)} />
                  </div>

                  {/* Position */}
                  <div className="grid gap-2">
                    <div className="flex items-center space-x-2">
                      <Briefcase />
                      <Label className="truncate font-semibold" htmlFor="position">Position</Label>
                    </div>
                    <Input id="position" type="text" placeholder="Software Engineer, Manager..." required 
                      value={position} onChange={(e) => setPosition(e.target.value)} />
                  </div>

                  {/* Error & Success Messages */}
                  {error && <p className="text-red-500">{error}</p>}
                  {message && <p className="text-green-500">{message}</p>}

                  {/* Signup Button */}
                  <Button type="submit" className="w-full">
                    <div className="flex items-center space-x-2">
                      <Rocket />
                      <span>Request Confirmation</span>
                    </div>
                  </Button>

                  {/* Redirect to Login */}
                  <div className="text-center text-sm">
                    Already have an account?{" "}
                    <a href="/login" className="underline underline-offset-4">Log in</a>
                  </div>
                </div>
              </form>

              {/* Right Side Image */}
              <div className="relative hidden bg-muted md:block">
                <img src={imageUrl} alt="Space background" className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale" />
              </div>
            </CardContent>
          </Card>

          {/* Terms and Conditions */}
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
            By signing up, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
}

