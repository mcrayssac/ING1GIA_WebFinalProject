import { Space_Grotesk, Space_Mono } from "next/font/google"
import { ClientLayout } from "@/components/client-layout"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
    weight: "300",
    variable: "--font-space-grotesk",
    subsets: ["latin"],
})

const spaceMono = Space_Mono({
    weight: "700",
    variable: "--font-space-mono",
    subsets: ["latin"],
})

export const metadata = {
    title: "SpaceY",
    description: "SpaceY is a space exploration company.",
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body
                className={`${spaceGrotesk.variable} ${spaceMono.variable} antialiased [--header-height:calc(theme(spacing.14))]`}
            >
                <ClientLayout>{children}</ClientLayout>
            </body>
        </html>
    )
}
