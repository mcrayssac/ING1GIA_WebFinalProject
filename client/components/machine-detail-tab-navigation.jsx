"use client"

import { motion } from "framer-motion"
import { Info, Layers, BarChart2 } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const iconComponents = {
    Info,
    Layers,
    BarChart2,
}

export function TabNavigation({ activeTab, onTabChange, tabs, children }) {
    return (
        <motion.div className="mb-8" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={onTabChange}>
                <TabsList className="grid grid-cols-3 mb-6 relative">
                    <motion.div
                        className="absolute bottom-0 h-0.5 bg-primary rounded-full"
                        animate={{
                            left: `${tabs.findIndex((tab) => tab.id === activeTab) * 33.33}%`,
                            width: "33.33%",
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />

                    {tabs.map((tab) => {
                        const Icon = iconComponents[tab.icon]
                        return (
                            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2 relative z-10">
                                <Icon className="h-4 w-4" />
                                <span>{tab.label}</span>
                                <motion.div
                                    className="absolute -z-10 inset-0 bg-primary/5 rounded-md"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: activeTab === tab.id ? 1 : 0 }}
                                />
                            </TabsTrigger>
                        )
                    })}
                </TabsList>

                {children}
            </Tabs>
        </motion.div>
    )
}
