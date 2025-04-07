"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Satellite, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export default function VerifySignupPage() {
  const [message, setMessage] = useState("Verifying...");
  const [status, setStatus] = useState("loading"); // loading | success | error
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid token.");
      return;
    }

    // Set a timeout to prevent premature "error" state
    const timeout = setTimeout(() => {
      if (status === "loading") {
        setMessage("Verification is taking longer than expected. Please wait...");
      }
    }, 10000); // 10 seconds timeout

    fetch(`${API_URL}/api/auth/verify-token?token=${token}`)
      .then(res => {
        if (!res.ok) {
          throw new Error("Failed to verify token");
        }
        return res.json();
      })
      .then(data => {
        clearTimeout(timeout); // Clear the timeout if the response is received
        if (data.success) {
          setStatus("success");
          setMessage("Email verified! Redirecting...");
          setTimeout(() => {
            router.push(`/create-account?email=${data.email}`);
          }, 2000);
        } else {
          setStatus("error");
          setMessage("Verification failed.");
        }
      })
      .catch(err => {
        console.error("Error verifying token:", err);
        clearTimeout(timeout); // Clear the timeout if an error occurs
        setStatus("error");
        setMessage("An error occurred.");
      });

    return () => clearTimeout(timeout); // Cleanup timeout on component unmount
  }, [router]);

  const icon =
    status === "loading" ? (
      <Satellite className="animate-spin-slow text-blue-400 h-8 w-8" />
    ) : status === "success" ? (
      <CheckCircle2 className="text-green-500 h-8 w-8" />
    ) : (
      <XCircle className="text-red-500 h-8 w-8" />
    );

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center space-y-4 p-8 text-center">
          {icon}
          <p className="text-lg font-semibold">{message}</p>
          {status === "error" && (
            <Button variant="outline" onClick={() => router.push("/signup")}>
              Back to Signup
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

