import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/components/footer";

import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
    weight: "300",
    variable: "--font-space-grotesk",
    subsets: ["latin"],
});

const spaceMono = Space_Mono({
    weight: "700",
    variable: "--font-space-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "SpaceY",
    description: "SpaceY is a space exploration company.",
};


export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body
                className={`${spaceGrotesk.variable} ${spaceMono.variable} antialiased [--header-height:calc(theme(spacing.14))]`}
            >
                <SidebarProvider className="flex flex-col min-h-screen">
                    <SiteHeader />
                    <div className="flex flex-1">
                        <AppSidebar />
                        <SidebarInset>
                            <div className="flex flex-1 flex-col gap-4 p-4">
                                {children}
                                <Footer />
                            </div>
                        </SidebarInset>
                    </div>
                </SidebarProvider>
            </body>
        </html>
    );
}

