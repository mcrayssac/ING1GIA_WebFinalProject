"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const UserContext = createContext()

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(undefined) // Initialize as undefined for loading state

    const router = useRouter()

    const logout = async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/users/logout`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            })
            setUser(false)
            router.push("/login")
        } catch (err) {
            console.error("Error logging out:", err)
            setUser(false)
        }
    }

    const fetchUser = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/users/infos`, {
                method: "GET",
                credentials: "include",
            })

            if (!response.ok) {
                setUser(false) // Set to false when no valid token/session
                return
            }
            
            const data = await response.json()
            setUser({
                name: data.username,
                avatar: data.photo,
                admin: data.admin,
                points: data.points,
                grade: data.grade ? {
                    name: data.grade.name,
                    icon: data.grade.icon,
                    color: data.grade.color,
                    cap: data.grade.cap
                } : null
            })
        } catch (err) {
            console.error("Error fetching user info:", err)
            // If there's an error and user is defined (not undefined or false), logout
            if (user !== undefined && user !== false) {
                await logout()
            } else {
                setUser(false)
            }
        }
    }

    useEffect(() => {
        fetchUser()
    }, [])

    return (
        <UserContext.Provider value={{ user, setUser, fetchUser, logout }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => useContext(UserContext)
