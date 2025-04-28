"use client"

import { createContext, useContext, useState, useEffect } from "react"

const UserContext = createContext()

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null)

    const fetchUser = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/users/infos`, {
                method: "GET",
                credentials: "include",
            })

            if (!response.ok) throw new Error("Failed to fetch user info")
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
            setUser(null)
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
