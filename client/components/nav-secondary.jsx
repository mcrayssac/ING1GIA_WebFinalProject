import * as React from "react";
import Cookies from "js-cookie";
import { Sun, Moon, ChevronRight, Palette } from "lucide-react";
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

// Available themes
const themes = [
    { name: "Light", value: "light", icon: Sun },
    { name: "Dark", value: "dark", icon: Moon },
    { name: "Cupcake", value: "cupcake" },
    { name: "Bumblebee", value: "bumblebee" },
    { name: "Emerald", value: "emerald" },
    { name: "Corporate", value: "corporate" },
    { name: "Synthwave", value: "synthwave" },
    { name: "Retro", value: "retro" },
    { name: "Cyberpunk", value: "cyberpunk" },
    { name: "Valentine", value: "valentine" },
    { name: "Halloween", value: "halloween" },
    { name: "Garden", value: "garden" },
    { name: "Forest", value: "forest" },
    { name: "Aqua", value: "aqua" },
    { name: "Lofi", value: "lofi" },
    { name: "Pastel", value: "pastel" },
    { name: "Fantasy", value: "fantasy" },
    { name: "Wireframe", value: "wireframe" },
    { name: "Black", value: "black" },
    { name: "Luxury", value: "luxury" },
    { name: "Dracula", value: "dracula" },
    { name: "Cmyk", value: "cmyk" },
    { name: "Autumn", value: "autumn" },
    { name: "Business", value: "business" },
    { name: "Acid", value: "acid" },
    { name: "Lemonade", value: "lemonade" },
    { name: "Night", value: "night" },
    { name: "Coffee", value: "coffee" },
    { name: "Winter", value: "winter" },
    { name: "Dim", value: "dim" },
    { name: "Nord", value: "nord" },
    { name: "Sunset", value: "sunset" },
];

export function NavSecondary({ items, ...props }) {
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

    return (
        <SidebarGroup {...props}>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild size="sm">
                                <a href={item.url}>
                                    <item.icon />
                                    <span>{item.title}</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}

                    <Collapsible defaultOpen={false}>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild size="sm">
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleThemeChange(currentTheme === "light" ? "dark" : "light");
                                    }}>
                                    <Palette />
                                    <span>Themes</span>
                                    <span className="ml-auto flex items-center text-xs text-secondary">
                                        {currentThemeOption.icon && (
                                            <currentThemeOption.icon className="w-4 h-4 mr-1" />
                                        )}
                                        <span>{currentThemeOption.name}</span>
                                    </span>
                                </a>
                            </SidebarMenuButton>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuAction className="data-[state=open]:rotate-90">
                                    <ChevronRight />
                                    <span className="sr-only">Toggle Themes</span>
                                </SidebarMenuAction>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    {themes.map((theme) => {
                                        const Icon = theme.icon;
                                        return (
                                            <SidebarMenuSubItem key={theme.value}>
                                                <SidebarMenuSubButton asChild>
                                                    <a
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleThemeChange(theme.value);
                                                        }}
                                                        className="text-primary"
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
