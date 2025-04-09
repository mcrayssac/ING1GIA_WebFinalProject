"use client"
import { useRouter } from "next/navigation"
import { useUser } from "@/contexts/UserContext"
import { useToastAlert } from "@/contexts/ToastContext"

import { BadgeCheck, ChevronsUpDown, LogOut, LogIn, Telescope, Sparkles, UserPlus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import MiniTierProgress from "./mini-tier-progress"

export function NavUser() {
    const { fetchUser, user } = useUser();
    const { toastSuccess, toastError } = useToastAlert();
    const { isMobile } = useSidebar();
    const router = useRouter();

    // Logout function to remove the token and redirect to login
    const handleLogout = () => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/users/logout`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                fetchUser()
                router.push("/login")
                toastSuccess("You have been logged out.")
            })
            .catch((err) => {
                console.error("Error logging out:", err)
                toastError("Error logging out.", { description: err.message })
            })
    }

    // If user is not available, render a login button
    if (!user) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <Telescope />
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Find your way !</span>
                                    <span className="truncate text-xs">Guest</span>
                                </div>
                                <ChevronsUpDown className="ml-auto size-4" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                            side={isMobile ? "bottom" : "right"}
                            align="end"
                            sideOffset={4}
                        >
                            <button
                                onClick={() => router.push("/signup")}
                                type="button"
                                className="relative flex select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors 
                focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 
                [&>svg]:shrink-0 hover:bg-accent hover:text-accent-foreground"
                            >
                                <UserPlus />
                                Sign up
                            </button>

                            <button
                                onClick={() => router.push("/login")}
                                type="button"
                                className="relative flex select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors 
                focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 
                [&>svg]:shrink-0 hover:bg-accent hover:text-accent-foreground"
                            >
                                <LogIn />
                                Log in
                            </button>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        )
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-primary data-[state=open]:text-sidebar-primary-foreground"
                        >
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="bg-secondary text-primary-foreground font-bold">
                                    {user.name
                                        .split(" ")
                                        .map((n) => n.charAt(0).toUpperCase())
                                        .join("")}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{user.name}</span>
                                <span className="truncate text-xs">{user.email}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback className="bg-secondary text-primary-foreground font-bold">
                                        {user.name
                                            .split(" ")
                                            .map((n) => n.charAt(0).toUpperCase())
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{user.name}</span>
                                    <span className="truncate text-xs">{user.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {/* Mini Progress Bar */}
                        <MiniTierProgress currentPoints={user.points || 150} />

                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <Sparkles />
                                Upgrade to Pro
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <button
                            onClick={() => router.push("/account")}
                            type="button"
                            className="relative flex select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors 
              focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 
              [&>svg]:shrink-0 hover:bg-accent hover:text-accent-foreground"
                        >
                            <BadgeCheck />
                            Account
                        </button>
                        <DropdownMenuSeparator />
                        <button
                            onClick={handleLogout}
                            type="button"
                            className="relative flex select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors 
              focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 
              [&>svg]:shrink-0 hover:bg-accent hover:text-accent-foreground"
                        >
                            <LogOut />
                            Log out
                        </button>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}

