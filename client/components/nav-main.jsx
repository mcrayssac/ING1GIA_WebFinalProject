"use client"

import * as Icons from "lucide-react";

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

export function NavMain({ object }) {
    const router = useRouter();

    return (
        (<SidebarGroup>
            <SidebarGroupLabel>{object.title}</SidebarGroupLabel>
            <SidebarMenu>
                {object.items.map((item) => {
                    const Icon = item.icon ? Icons[item.icon] : null;
                    return (
                        <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip={item.title}>
                                    <button onClick={() => { router.push(item.url) }}>
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
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {item.items?.map((subItem) => {
                                                    const SubIcon = subItem.icon ? Icons[subItem.icon] : null;
                                                    return (
                                                        <SidebarMenuSubItem key={subItem.title}>
                                                            <SidebarMenuSubButton asChild>
                                                                <button onClick={() => { router.push(subItem.url) }}>
                                                                    {SubIcon && <SubIcon style={{ color: "oklch(var(--p))" }} />}
                                                                    <span>{subItem.title}</span>
                                                                </button>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    )
                                                }
                                                )}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </>
                                ) : null}
                            </SidebarMenuItem>
                        </Collapsible>
                    )
                }
                )}
            </SidebarMenu>
        </SidebarGroup>)
    );
}
