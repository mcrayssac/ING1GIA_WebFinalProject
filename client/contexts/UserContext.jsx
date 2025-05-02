"use client"

import { createContext, useContext, useState, useEffect } from "react"

const UserContext = createContext()

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(undefined) // Initialize as undefined for loading state

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
            setUser(false) // Set to false on error
        }
    }

    useEffect(() => {
        fetchUser()
    }, [])

    return (
        <UserContext.Provider value={{ user, setUser, fetchUser }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => useContext(UserContext)
