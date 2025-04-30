import * as React from "react";
import Cookies from "js-cookie";
import * as Icons from "lucide-react";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarMenuAction,
} from "@/components/ui/sidebar";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useRouter } from "next/navigation"

import { themes } from "@/data/data";

export function NavSecondary({ items, ...props }) {
    const router = useRouter();

    // State for the current theme
    const currentDate = new Date();
    const themeFromCookie = Cookies.get("theme") || (currentDate.getHours() >= 18 || currentDate.getHours() < 8 ? "dark" : "light");
    const [currentTheme, setCurrentTheme] = React.useState(themeFromCookie);
    React.useEffect(() => {
        document.documentElement.setAttribute("data-theme", currentTheme);
    }, [currentTheme]);

    // Handle theme change
    const handleThemeChange = (themeValue) => {
        // Set the theme cookie (expires in 7 days) and update the document's data-theme attribute
        Cookies.set("theme", themeValue, { expires: 7, path: "/" });
        if (typeof document !== "undefined") document.documentElement.setAttribute("data-theme", themeValue);
        setCurrentTheme(themeValue);
    };

    // Read the theme from the cookie or default to light
    const currentThemeOption = themes.find((t) => t.value === currentTheme) || { name: currentTheme };
    const CurrentThemeIcon = currentThemeOption.icon ? Icons[currentThemeOption.icon] : null;

    return (
        <SidebarGroup {...props}>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => {
                        const Icon = item.icon ? Icons[item.icon] : null;
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild size="sm">
                                    <button data-navigation="true" onClick={() => { window.location.href = item.url; }}>
                                        {Icon && <Icon />}
                                        <span>{item.title}</span>
                                    </button>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    }
                    )}

                    <Collapsible defaultOpen={false}>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild size="sm">
                                <a
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleThemeChange(currentTheme === "light" ? "dark" : "light");
                                    }}
                                    className="link link-hover"
                                    >
                                    <Icons.Palette />
                                    <span>Themes</span>
                                    <span className="ml-auto flex items-center text-xs text-secondary">
                                        {CurrentThemeIcon && (
                                            <CurrentThemeIcon className="w-4 h-4 mr-1" />
                                        )}
                                        <span>{currentThemeOption.name}</span>
                                    </span>
                                </a>
                            </SidebarMenuButton>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuAction className="data-[state=open]:rotate-90">
                                    <Icons.ChevronRight />
                                    <span className="sr-only">Toggle Themes</span>
                                </SidebarMenuAction>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    {themes.map((theme) => {
                                        const Icon = theme.icon ? Icons[theme.icon] : null;
                                        return (
                                            <SidebarMenuSubItem key={theme.value}>
                                                <SidebarMenuSubButton asChild>
                                                    <a
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleThemeChange(theme.value);
                                                        }}
                                                        className="text-primary link link-hover"
                                                    >
                                                        {Icon && <Icon style={{ color: "oklch(var(--p))" }} />}
                                                        <span>{theme.name}</span>
                                                    </a>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        );
                                    })}
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </SidebarMenuItem>
                    </Collapsible>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
