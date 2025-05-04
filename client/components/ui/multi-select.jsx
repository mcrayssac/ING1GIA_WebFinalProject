"use client"

import { useState, useEffect, useRef } from "react"
import { X, Check, ChevronDown, Search } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { createPortal } from "react-dom"

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Select items...",
    className,
    disabled = false,
    variant = "primary", // Support dynamic variants based on project's theme
    showSelectAll = true, // Add showSelectAll prop with default true
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const containerRef = useRef(null)
    const dropdownRef = useRef(null)
    const searchInputRef = useRef(null)
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
    const [portalContainer, setPortalContainer] = useState(null)
    const isMounted = useRef(true)

    // Enhanced color variants using theme tokens
    const colorVariants = {
        primary: {
            badge: "bg-primary text-primary-foreground",
            hover: "hover:border-primary",
            ring: "ring-primary",
            border: "border-primary",
            selected: "bg-primary text-primary-foreground",
            checkbox: "bg-primary text-primary-foreground border-primary",
            text: "text-primary-foreground",
            muted: "text-muted-foreground",
            placeholder: "text-muted-foreground",
            bg: "bg-background",
            bgHover: "hover:bg-base-200",
            bgHoverDark: "dark:hover:bg-primary",
            borderColor: "border-border dark:border-primary",
            focusRing: "focus:ring-primary",
            icon: "text-muted-foreground",
        },
        secondary: {
            badge: "bg-secondary text-secondary-foreground",
            hover: "hover:border-secondary",
            ring: "ring-secondary",
            border: "border-secondary",
            selected: "bg-secondary text-secondary-foreground",
            checkbox: "bg-secondary text-secondary-foreground border-secondary",
            text: "text-secondary-foreground",
            muted: "text-muted-foreground",
            placeholder: "text-muted-foreground",
            bg: "bg-background",
            bgHover: "hover:bg-base-200",
            bgHoverDark: "dark:hover:bg-secondary",
            borderColor: "border-border dark:border-secondary",
            focusRing: "focus:ring-secondary",
            icon: "text-muted-foreground",
        },
        accent: {
            badge: "bg-accent text-accent-foreground",
            hover: "hover:border-accent",
            ring: "ring-accent",
            border: "border-accent",
            selected: "bg-accent text-accent-foreground",
            checkbox: "bg-accent text-accent-foreground border-accent",
            text: "text-accent-foreground",
            muted: "text-muted-foreground",
            placeholder: "text-muted-foreground",
            bg: "bg-background",
            bgHover: "hover:bg-base-200",
            bgHoverDark: "dark:hover:bg-accent",
            borderColor: "border-border dark:border-accent",
            focusRing: "focus:ring-accent",
            icon: "text-muted-foreground",
        },
        destructive: {
            badge: "bg-destructive text-destructive-foreground",
            hover: "hover:border-destructive",
            ring: "ring-destructive",
            border: "border-destructive",
            selected: "bg-destructive text-destructive-foreground",
            checkbox: "bg-destructive text-destructive-foreground border-destructive",
            text: "text-destructive-foreground",
            muted: "text-muted-foreground",
            placeholder: "text-muted-foreground",
            bg: "bg-background",
            bgHover: "hover:bg-base-200",
            bgHoverDark: "dark:hover:bg-destructive",
            borderColor: "border-border dark:border-destructive",
            focusRing: "focus:ring-destructive",
            icon: "text-muted-foreground",
        },
        muted: {
            badge: "bg-muted text-muted-foreground",
            hover: "hover:border-muted",
            ring: "ring-muted",
            border: "border-muted",
            selected: "bg-muted text-muted-foreground",
            checkbox: "bg-muted text-muted-foreground border-muted",
            text: "text-muted-foreground",
            muted: "text-muted-foreground",
            placeholder: "text-muted-foreground",
            bg: "bg-background",
            bgHover: "hover:bg-base-200",
            bgHoverDark: "dark:hover:bg-muted",
            borderColor: "border-border dark:border-muted",
            focusRing: "focus:ring-muted",
            icon: "text-muted-foreground",
        }
    }

    // Use the variant or default to primary if not valid
    const colors = colorVariants[variant] || colorVariants.primary

    // Filter options based on search term
    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    )

    useEffect(() => {
        return () => {
            isMounted.current = false
        }
    }, [])

    // Update dropdown position when it opens
    useEffect(() => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            setDropdownPosition({
                top: rect.top + rect.height + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width
            })
        }
    }, [isOpen])

    // Create portal container
    useEffect(() => {
        if (typeof document !== 'undefined') {
            // Check if a portal container already exists
            let container = document.getElementById('multi-select-portal')
            
            // Create portal container if it doesn't exist
            if (!container) {
                container = document.createElement('div')
                container.id = 'multi-select-portal'
                container.style.position = 'absolute'
                container.style.top = '0'
                container.style.left = '0'
                container.style.zIndex = '9999'
                document.body.appendChild(container)
            }
            
            setPortalContainer(container)
        }

        return () => {
            // Clean up only if component is unmounted and portal is not used elsewhere
        }
    }, [])

    // Toggle dropdown
    const toggleDropdown = (e) => {
        e?.stopPropagation()
        if (!disabled) {
            setIsOpen(!isOpen)
            if (!isOpen) {
                // Clear search when opening
                setSearchTerm("")
            }
        }
    }

    // Toggle selection of an option
    const toggleOption = (option) => {
        const isSelected = selected.some((item) => item.value === option.value)
        let updatedSelection

        if (isSelected) {
            updatedSelection = selected.filter((item) => item.value !== option.value)
        } else {
            updatedSelection = [...selected, option]
        }

        onChange(updatedSelection)
        // We explicitly don't close the dropdown after selection
    }

    // Remove an option
    const removeOption = (value, e) => {
        e?.stopPropagation()
        const updatedSelection = selected.filter((item) => item.value !== value)
        onChange(updatedSelection)
    }

    // Handle select all / deselect all
    const handleSelectAll = () => {
        const allFilteredSelected = filteredOptions.every((option) =>
            selected.some((s) => s.value === option.value)
        )

        if (allFilteredSelected) {
            // Deselect all filtered options
            const newSelected = selected.filter(
                (item) => !filteredOptions.some((option) => option.value === item.value)
            )
            onChange(newSelected)
        } else {
            // Select all filtered options that aren't already selected
            const newSelectedValues = new Set(selected.map((item) => item.value))
            filteredOptions.forEach((option) => {
                newSelectedValues.add(option.value)
            })

            // Map back to full option objects
            const newSelected = Array.from(newSelectedValues).map((value) => {
                const existingOption = selected.find((item) => item.value === value)
                if (existingOption) return existingOption

                return options.find((option) => option.value === value)
            })

            onChange(newSelected)
        }
    }

    // Handle keyboard navigation
    const handleKeyDown = (e, option) => {
        switch (e.key) {
            case " ":
            case "Enter":
                e.preventDefault()
                toggleOption(option)
                break
            case "Escape":
                setIsOpen(false)
                break
        }
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
            if (searchInputRef.current) {
                setTimeout(() => searchInputRef.current?.focus(), 10)
            }
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isOpen])

    return (
        <div className="relative w-full" ref={containerRef}>
            <motion.div
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-controls="multi-select-options"
                aria-disabled={disabled}
                tabIndex={disabled ? -1 : 0}
                whileTap={{ scale: disabled ? 1 : 0.98 }}
                className={cn(
                    "flex flex-wrap gap-1.5 p-2 border rounded-md cursor-pointer min-h-[2.5rem] items-center transition-all duration-200 bg-background",
                    isOpen ? `ring-2 ${colors.ring} ${colors.border}` : colors.hover,
                    disabled ? "opacity-50 cursor-not-allowed bg-muted" : "",
                    className
                )}
                onClick={toggleDropdown}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        toggleDropdown(e)
                    } else if (e.key === "Escape" && isOpen) {
                        setIsOpen(false)
                    }
                }}
            >
                <div className="flex flex-1 flex-wrap gap-1.5">
                    {selected.length > 0 ? (
                        selected.map((option) => (
                            <div
                                key={option.value}
                                className={cn(
                                    `px-2 py-1 rounded-md text-sm flex items-center gap-1 group transition-all duration-200`,
                                    colors.badge
                                )}
                            >
                                {option.label}
                                {!disabled && (
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={(e) => removeOption(option.value, e)}
                                        className="rounded-full h-4 w-4 flex items-center justify-center transition-colors hover:bg-primary"
                                        aria-label={`Remove ${option.label}`}
                                    >
                                        <X className="h-3 w-3" />
                                    </motion.button>
                                )}
                            </div>
                        ))
                    ) : (
                        <span className={colors.placeholder}>{placeholder}</span>
                    )}
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-auto flex-shrink-0"
                >
                    <ChevronDown className={`h-4 w-4 ${colors.icon}`} />
                </motion.div>
            </motion.div>

            {/* Dropdown - Rendered in Portal */}
            {isOpen && portalContainer && createPortal(
                <AnimatePresence>
                    <motion.div
                        ref={dropdownRef}
                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                        transition={{ duration: 0.2, type: "spring", stiffness: 500, damping: 25 }}
                        className={`bg-background border ${colors.borderColor} rounded-md shadow-lg max-h-60 overflow-hidden flex flex-col z-[9999]`}
                        style={{ 
                            position: "absolute", 
                            top: `${dropdownPosition.top}px`,
                            left: `${dropdownPosition.left}px`,
                            width: `${dropdownPosition.width}px`,
                            transformOrigin: "top center" 
                        }}
                    >
                        {/* Search input */}
                        <div className={`p-2 border-b ${colors.borderColor} sticky top-0 bg-background z-[101]`}>
                            <div className="relative">
                                <Search className={`absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 ${colors.icon}`} />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search..."
                                    className={cn(
                                        `w-full pl-8 pr-2 py-1.5 text-sm border ${colors.borderColor} rounded-md focus:outline-none focus:ring-2 bg-background text-foreground placeholder:${colors.placeholder}`,
                                        `focus:${colors.ring}`
                                    )}
                                    aria-controls="multi-select-options"
                                />
                            </div>
                        </div>

                        {/* Select All option */}
                        {showSelectAll && filteredOptions.length > 0 && (
                            <div className={`border-b ${colors.borderColor}`}>
                                <motion.div
                                    className={`p-2 cursor-pointer text-sm flex items-center justify-between ${colors.bgHover} ${colors.bgHoverDark}`}
                                    onClick={handleSelectAll}
                                >
                                    <div className="flex items-center">
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={cn(
                                                "w-4 h-4 mr-2 border rounded flex items-center justify-center",
                                                filteredOptions.every((option) =>
                                                    selected.some((s) => s.value === option.value)
                                                )
                                                    ? `${colors.checkbox}`
                                                    : `${colors.borderColor}`
                                            )}
                                        >
                                            {filteredOptions.every((option) =>
                                                selected.some((s) => s.value === option.value)
                                            ) && <Check className="h-3 w-3" />}
                                        </motion.div>
                                        <span className="font-medium">
                                            {filteredOptions.every((option) =>
                                                selected.some((s) => s.value === option.value)
                                            )
                                                ? "Deselect All"
                                                : "Select All"}
                                        </span>
                                    </div>
                                    <span className={colors.muted}>
                                        {selected.length} of {options.length} selected
                                    </span>
                                </motion.div>
                            </div>
                        )}

                        {/* Options list */}
                        <div
                            className="overflow-auto"
                            role="listbox"
                            id="multi-select-options"
                            aria-multiselectable="true"
                            tabIndex={-1}
                        >
                            {filteredOptions.length > 0 ? (
                                <AnimatePresence>
                                    {filteredOptions.map((option, index) => {
                                        const isItemSelected = selected.some((s) => s.value === option.value)
                                        return (
                                            <motion.div
                                                key={option.value}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    duration: 0.15,
                                                    delay: index * 0.03,
                                                    type: "spring",
                                                    stiffness: 400,
                                                    damping: 25,
                                                }}
                                                whileHover={{
                                                    transition: { duration: 0.1 },
                                                }}
                                                role="option"
                                                aria-selected={isItemSelected}
                                                tabIndex={0}
                                                className={cn(
                                                    `p-2.5 cursor-pointer text-sm flex items-center transition-colors ${colors.bgHover} ${colors.bgHoverDark}`,
                                                    isItemSelected ? " font-medium" : ""
                                                )}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    toggleOption(option);
                                                }}
                                                onKeyDown={(e) => handleKeyDown(e, option)}
                                            >
                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className={cn(
                                                        "w-4 h-4 mr-2 border rounded flex items-center justify-center transition-colors",
                                                        isItemSelected
                                                            ? colors.checkbox
                                                            : colors.borderColor
                                                    )}
                                                >
                                                    {isItemSelected && <Check className="h-3 w-3" />}
                                                </motion.div>
                                                {option.label}
                                            </motion.div>
                                        )
                                    })}
                                </AnimatePresence>
                            ) : (
                                <div className={`p-2 text-center text-sm ${colors.muted}`}>No options found</div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>,
                portalContainer
            )}
        </div>
    )
}

export default MultiSelect
