"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useForm } from "react-hook-form";
import { Loader2, CalendarIcon, UserPen } from "lucide-react";

import Alert from "@/components/user-alert";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function AccountPage() {
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isImageUploading, setIsImageUploading] = useState(false);
    const [avatarSrc, setAvatarSrc] = useState("");

    // React Hook Form setup
    // Registering form fields and handling validation
    // Using react-hook-form for form management
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        mode: "onChange",
    });

    // Fetch user info on mount
    useEffect(() => {
        const token = Cookies.get("token");
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/users/infos`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        })
            .then((response) => {
                if (!response.ok) throw new Error("Failed to fetch user info");
                return response.json();
            })
            .then((data) => {
                // Set the fetched data to the form
                setValue("_id", data._id);
                setValue("username", data.username);
                setValue("email", data.email || "");
                setValue("bio", data.bio || "");
                setValue("urls.x", data.urls.x || "");
                setValue("urls.linkedin", data.urls.linkedin || "");
                setValue("dob", new Date(data.dob) || "");
                setValue("location", data.location || "");
                setIsImageUploading(true);
                setAvatarSrc(data.photo || "");
                setIsImageUploading(false);
            })
            .catch((err) => {
                console.error("Error fetching user info:", err);
                window.location.href = "/login";
            });
    }, []);

    // Updated onSubmit: sends data to the API route
    function onSubmit(data) {
        setIsLoading(true);
        data.photo = avatarSrc;
        console.log("Submitting data:", data);
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/users/${data._id}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${Cookies.get("token")}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to update user");
                return res.json();
            })
            .then((result) => {
                setIsLoading(false);
            })
            .catch((err) => {
                console.error("Error updating user:", err);
                setError(err.message);
                setIsLoading(false);
            });
    }

    // Handle image upload
    function handleImageUpload(event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        const maxSize = 2 * 1024 * 1024; // 2MB in bytes
        if (file.size > maxSize) {
            alert("File is too large. Maximum allowed size is 2MB.");
            return;
        }

        setIsImageUploading(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            setAvatarSrc(e.target.result);
            setIsImageUploading(false);
        };
        reader.readAsDataURL(file);
    }

    // Date formatting using built-in toLocaleDateString
    const formatDate = (date) => {
        if (!date) return "";
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <>
            {error && <Alert type="error" message={error} onClose={() => setError("")} />}
            <div className="container mt-8 mx-auto px-4 py-8">
                <div className="flex items-center space-x-4">
                    <UserPen className="w-8 h-8" />
                    <h1 className="text-4xl font-black font-mono text-start">Account</h1>
                </div>
                <div className="flex flex-col md:flex-row gap-4 md:gap-8  mt-12">
                    <Card className="w-full md:w-1/3 shadow-xl text-primary-content">
                        <CardHeader>
                            <CardTitle className="text-accent-foreground">Your avatar</CardTitle>
                            <CardDescription>This is your profile picture.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4 justify-center">
                            <div className="relative">
                                <Avatar className="h-full w-full max-w-[200px]">
                                    <AvatarImage src={avatarSrc} alt="Profile" />
                                    <AvatarFallback className="bg-secondary min-h-[100px] min-w-[100px] text-lg font-bold">
                                        {
                                            (watch("username") || "").split(" ").map((name) => name.charAt(0).toUpperCase()).join("")
                                        }
                                    </AvatarFallback>
                                </Avatar>
                                {isImageUploading && (
                                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="text-sm text-muted-foreground">
                                    Recommended size: 200x200px
                                </p>
                                <Separator className="my-2" />
                                <p className="text-sm text-muted-foreground">
                                    Supported formats: JPG, PNG, GIF
                                </p>
                                <p className="text-sm text-muted-foreground">Max size: 2MB</p>
                            </div>
                            <div className="flex flex-wrap gap-2 justify-center w-full">
                                <Label
                                    htmlFor="avatar-upload"
                                    className="cursor-pointer rounded-md bg-accent-foreground px-3 py-2 text-sm font-medium text-primary font-bold shadow hover:bg-accent items-center flex justify-center min-w-[100px]"
                                >
                                    Change
                                </Label>
                                <Input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                                <Button
                                    variant="secondary"
                                    className="hover:bg-accent hover:text-secondary font-bold min-w-[100px]"
                                    onClick={() => {
                                        setAvatarSrc("");
                                    }
                                    }
                                    disabled={isLoading}
                                >
                                    Remove
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="flex-1">
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardHeader>
                                <CardTitle className="text-accent-foreground">Profile informations</CardTitle>
                                <CardDescription>Update your profile informations.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Username */}
                                <div className="grid gap-3">
                                    <Label htmlFor="username" className="font-bold">
                                        Username
                                    </Label>
                                    <Input
                                        id="username"
                                        placeholder="Username"
                                        className="border-2"
                                        {...register("username", {
                                            required: "Username is required",
                                            minLength: {
                                                value: 2,
                                                message: "Username must be at least 2 characters.",
                                            },
                                            maxLength: {
                                                value: 30,
                                                message: "Username must not be longer than 30 characters.",
                                            },
                                        })}
                                    />
                                    {errors.username && (
                                        <p className="text-sm text-destructive">{errors.username.message}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="grid gap-3">
                                    <Label htmlFor="email" className="font-bold">
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Email"
                                        className="border-2"
                                        {...register("email", {
                                            // required: "Email is required",
                                            pattern: {
                                                value: /^\S+@\S+\.\S+$/,
                                                message: "This is not a valid email",
                                            },
                                        })}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive">{errors.email.message}</p>
                                    )}
                                </div>

                                {/* Bio */}
                                <div className="grid gap-3">
                                    <Label htmlFor="bio" className="font-bold">
                                        Bio
                                    </Label>
                                    <Textarea
                                        id="bio"
                                        placeholder="Tell us about yourself"
                                        className="border-2"
                                        {...register("bio", {
                                            maxLength: {
                                                value: 160,
                                                message: "Bio must not be longer than 160 characters.",
                                            },
                                        })}
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        {(watch("bio") ? watch("bio").length : 0)}/160 characters
                                    </p>
                                    {errors.bio && (
                                        <p className="text-sm text-destructive">{errors.bio.message}</p>
                                    )}
                                </div>

                                {/* Date of Birth */}
                                <div className="grid gap-3">
                                    <Label htmlFor="dob" className="font-bold">
                                        Date of Birth
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                id="dob"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal border-2 border-accent-foreground",
                                                    !watch("dob") && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {watch("dob")
                                                    ? formatDate(watch("dob"))
                                                    : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={watch("dob")}
                                                onSelect={(date) => setValue("dob", date)}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* Location */}
                                <div className="grid gap-3">
                                    <Label htmlFor="location" className="font-bold">
                                        Location
                                    </Label>
                                    <Input
                                        id="location"
                                        placeholder="Location"
                                        className="border-2"
                                        {...register("location")}
                                    />
                                </div>

                                {/* X and LinkedIn */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-3">
                                        <Label htmlFor="x" className="font-bold">
                                            X
                                        </Label>
                                        <div className="flex">
                                            <span className="flex items-center rounded-l-md border border-2 border-r-0 bg-muted px-3 text-muted-foreground font-bold">
                                                @
                                            </span>
                                            <Input
                                                id="x"
                                                placeholder="x"
                                                className="rounded-l-none border-2"
                                                {...register("urls.x")}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-3">
                                        <Label htmlFor="linkedin" className="font-bold">
                                            LinkedIn
                                        </Label>
                                        <div className="flex">
                                            <span className="flex items-center rounded-l-md border border-2 border-r-0 bg-muted px-3 text-muted-foreground font-bold">
                                                in/
                                            </span>
                                            <Input
                                                id="linkedin"
                                                placeholder="linkedin"
                                                className="rounded-l-none border-2"
                                                {...register("urls.linkedin")}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    variant="secondary"
                                    className="hover:bg-accent hover:text-secondary font-bold"
                                >
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </>
    );
}
