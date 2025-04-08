"use client"

import { createContext, useContext } from "react"
import { toast } from "sonner"

const ToastContext = createContext()

export const ToastProvider = ({ children }) => {
    const toastSuccess = (message, options = {}) => {
        toast.success(message, options)
    }

    const toastError = (message, options = {}) => {
        toast.error(message, options)
    }

    const toastInfo = (message, options = {}) => {
        toast(message, options)
    }

    const toastWarning = (message, options = {}) => {
        toast.warning ? toast.warning(message, options) : toast(message, { ...options, description: "⚠️ Warning" })
    }

    return (
        <ToastContext.Provider value={{ toastSuccess, toastError, toastInfo, toastWarning }}>
            {children}
        </ToastContext.Provider>
    )
}

export const useToastAlert = () => {
    const context = useContext(ToastContext)
    if (!context) throw new Error("useToastAlert must be used within a ToastProvider")
    return context
}
