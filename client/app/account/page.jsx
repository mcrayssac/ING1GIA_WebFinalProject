"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, CalendarIcon, UserPen } from "lucide-react";
// Removed date-fns dependency

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

const defaultValues = {
    username: "johndoe",
    email: "john.doe@example.com",
    bio: "I'm a software developer based in New York. I love building web applications and exploring new technologies.",
    urls: {
        website: "https://johndoe.com",
        twitter: "johndoe",
        linkedin: "johndoe",
    },
    dob: new Date("1990-01-01"),
    location: "New York, USA",
};

export default function AccountPage() {
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isImageUploading, setIsImageUploading] = useState(false);
    const [avatarSrc, setAvatarSrc] = useState("/placeholder.svg?height=100&width=100");

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues,
        mode: "onChange",
    });

    function onSubmit(data) {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            console.log(data);
            setIsLoading(false);
        }, 1000);
    }

    function handleImageUpload(event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        setIsImageUploading(true);
        // Simulate image upload
        setTimeout(() => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarSrc(e.target.result);
                setIsImageUploading(false);
            };
            reader.readAsDataURL(file);
        }, 1000);
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
                            <CardTitle className="text-accent-foreground">Votre photo</CardTitle>
                            <CardDescription>Cette photo sera affichée sur votre profil.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4">
                            <div className="relative">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={avatarSrc} alt="Profile" />
                                    <AvatarFallback className="bg-secondary">JD</AvatarFallback>
                                </Avatar>
                                {isImageUploading && (
                                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Label  
                                    htmlFor="avatar-upload"
                                    className="cursor-pointer rounded-md bg-accent-foreground px-3 py-2 text-sm font-medium text-primary font-bold shadow hover:bg-accent"
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
                                <Button variant="secondary" className="hover:bg-accent hover:text-secondary font-bold">
                                    Remove
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="flex-1">
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardHeader>
                                <CardTitle className="text-accent-foreground">Informations du profil</CardTitle>
                                <CardDescription>Mettez à jour vos informations de profil.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Username part */}
                                <div className="grid gap-3">
                                    <Label htmlFor="username" className="font-bold">Username</Label>
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
                                        <p className="text-sm text-destructive">
                                            {errors.username.message}
                                        </p>
                                    )}
                                </div>

                                {/* Email part */}
                                <div className="grid gap-3">
                                    <Label htmlFor="email" className="font-bold">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Email"
                                        className="border-2"
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: {
                                                value: /^\S+@\S+\.\S+$/,
                                                message: "This is not a valid email",
                                            },
                                        })}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>

                                {/* Bio part */}
                                <div className="grid gap-3">
                                    <Label htmlFor="bio" className="font-bold">Bio</Label>
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
                                        <p className="text-sm text-destructive">
                                            {errors.bio.message}
                                        </p>
                                    )}
                                </div>

                                {/* Date of Birth part */}
                                <div className="grid gap-3">
                                    <Label htmlFor="dob" className="font-bold">Date of Birth</Label>
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

                                {/* Location part */}
                                <div className="grid gap-3">
                                    <Label htmlFor="location" className="font-bold">Location</Label>
                                    <Input
                                        id="location"
                                        placeholder="Location"
                                        className="border-2"
                                        {...register("location")}
                                    />
                                </div>

                                {/* URLs part */}
                                <div className="grid gap-3">
                                    <Label htmlFor="website" className="font-bold">Website</Label>
                                    <Input
                                        id="website"
                                        placeholder="https://example.com"
                                        className="border-2"
                                        {...register("urls.website", {
                                            validate: (value) =>
                                                !value ||
                                                /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(value) ||
                                                "Please enter a valid URL.",
                                        })}
                                    />
                                    {errors.urls && errors.urls.website && (
                                        <p className="text-sm text-destructive">
                                            {errors.urls.website.message}
                                        </p>
                                    )}
                                </div>

                                {/* Twitter and LinkedIn part */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-3">
                                        <Label htmlFor="twitter" className="font-bold">Twitter</Label>
                                        <div className="flex">
                                            <span className="flex items-center rounded-l-md border border-2 border-r-0 bg-muted px-3 text-muted-foreground font-bold">
                                                @
                                            </span>
                                            <Input
                                                id="twitter"
                                                placeholder="twitter"
                                                className="rounded-l-none border-2"
                                                {...register("urls.twitter")}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-3">
                                        <Label htmlFor="linkedin" className="font-bold">LinkedIn</Label>
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
                                <Button type="submit" disabled={isLoading} variant="secondary" className="hover:bg-accent hover:text-secondary font-bold">
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
