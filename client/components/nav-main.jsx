"use client"

import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"

const menuItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
};

const subMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
        opacity: 1, 
        height: "auto",
        transition: {
            duration: 0.3,
            ease: "easeOut"
        }
    },
    exit: { 
        opacity: 0, 
        height: 0,
        transition: {
            duration: 0.2,
            ease: "easeIn"
        }
    }
};

export function NavMain({ object }) {
    const router = useRouter();

    return (
        (<motion.div
            initial="hidden"
            animate="visible"
            variants={{
                hidden: {},
                visible: {
                    transition: {
                        staggerChildren: 0.05
                    }
                }
            }}
        >
            <SidebarGroup>
                <motion.div variants={menuItemVariants}>
                    <SidebarGroupLabel>{object.title}</SidebarGroupLabel>
                </motion.div>
                <SidebarMenu>
                {object.items.map((item) => {
                    const Icon = item.icon ? Icons[item.icon] : null;
                    return (
                        <motion.div key={item.title} variants={menuItemVariants}>
                            <Collapsible asChild defaultOpen={item.isActive}>
                                <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip={item.title}>
                                    <button data-navigation="true" onClick={() => { router.push(item.url) }}>
                                        {Icon && <Icon />}
                                        <span>{item.title}</span>
                                    </button>
                                </SidebarMenuButton>
                                {item.items?.length ? (
                                    <>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuAction className="data-[state=open]:rotate-90">
                                                <Icons.ChevronRight />
                                                <span className="sr-only">Toggle</span>
                                            </SidebarMenuAction>
                                        </CollapsibleTrigger>
                                        <AnimatePresence>
                                    <motion.div
                                        variants={subMenuVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                    >
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {item.items?.map((subItem) => {
                                                    const SubIcon = subItem.icon ? Icons[subItem.icon] : null;
                                                    return (
                                                        <motion.div
                                                            key={subItem.title}
                                                            variants={menuItemVariants}
                                                        >
                                                            <SidebarMenuSubItem>
                                                            <SidebarMenuSubButton asChild>
                                                                <button data-navigation="true" onClick={() => { router.push(subItem.url) }}>
                                                                    {SubIcon && <SubIcon style={{ color: "oklch(var(--p))" }} />}
                                                                    <span>{subItem.title}</span>
                                                                </button>
                                                            </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        </motion.div>
                                                    );
                                                })}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </motion.div>
                                </AnimatePresence>
                                    </>
                                ) : null}
                                </SidebarMenuItem>
                            </Collapsible>
                        </motion.div>
                    )
                }
                )}
                </SidebarMenu>
            </SidebarGroup>
        </motion.div>)
    );
}
