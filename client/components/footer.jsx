"use client";

import * as Icons from "lucide-react";
import { useRouter } from "next/navigation";

import { navGuest, navUser, navAdmin, navSecondary } from "@/data/data";
import { useUser } from "@/contexts/UserContext";

function FooterHeader({ data }) {
    const router = useRouter();

    return (
        <nav>
            <h6 className="footer-title font-mono text-accent-foreground">{data.title}</h6>
            {data.items.map((link) => {
                const Icon = link.icon ? Icons[link.icon] : null;
                return (
                    <div key={link.title} className="flex items-center gap-2">
                        {Icon && <Icon className="w-4 h-4" />}
                        <a
                            key={link.url}
                            data-navigation="true"
                            onClick={() => router.push(link.url)}
                            className="link link-hover"
                        >
                            {link.title}
                        </a>
                    </div>
                )
            }
            )}
        </nav>
    );
}

export default function Footer() {
    const { user } = useUser();

    return (
        <div>
            <footer className={`footer text-base-content p-10 rounded-t-2xl bg-primary text-primary-content shadow-xl`}>
                {/* Guest navigation - always visible */}
                <FooterHeader data={navGuest} />

                {/* User navigation when logged in */}
                {user && <FooterHeader data={navUser} />}

                {/* Admin navigation for admin users */}
                {user?.admin && <FooterHeader data={navAdmin} />}

                {/* Secondary navigation */}
                <nav>
                    <h6 className="footer-title font-mono text-accent-foreground">Links</h6>
                    {navSecondary.map((link) => {
                        const Icon = link.icon ? Icons[link.icon] : null;
                        return (
                            <div key={link.title} className="flex items-center gap-2">
                                {Icon && <Icon className="w-4 h-4" />}
                                <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="link link-hover"
                                >
                                    {link.title}
                                </a>
                            </div>
                        );
                    })}
                </nav>
            </footer>
            <footer className={`footer text-base-content border-base-300 border-t px-10 py-4 rounded-b-2xl bg-primary text-primary-content shadow-xl`}>
                <aside className="grid-flow-col items-center font-mono">
                    <Icons.Orbit className="w-9 h-9 animate-spin mr-2" style={{ animationDuration: "10s" }} />
                    <p>
                        SpaceY Company
                        <br />
                        Providing space exploration services since 2002
                        <br />
                        Copyright © 2025 - All rights reserved by SpaceY
                    </p>
                </aside>
                <nav className="md:place-self-center md:justify-self-end">
                    <div className="grid grid-flow-col gap-4 animate-bounce" style={{ animationDuration: "5s" }}>
                        <a className="link link-hover transition-transform transform hover:scale-125" href="https://github.com/mcrayssac/ING1GIA_WebFinalProject" target="_blank" rel="noopener noreferrer">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-github-icon lucide-github">
                                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                                <path d="M9 18c-4.51 2-5-2-7-2" />
                            </svg>
                        </a>
                        <a className="link link-hover transition-transform transform hover:scale-125" href="https://www.instagram.com/spacex/" target="_blank" rel="noopener noreferrer">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-instagram-icon lucide-instagram">
                                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                            </svg>
                        </a>
                        <a className="link link-hover transition-transform transform hover:scale-125" href="https://www.linkedin.com/company/spacex/" target="_blank" rel="noopener noreferrer">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-linkedin-icon lucide-linkedin">
                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                <rect width="4" height="12" x="2" y="9" />
                                <circle cx="4" cy="4" r="2" />
                            </svg>
                        </a>
                        <a className="link link-hover transition-transform transform hover:scale-125" href="https://www.youtube.com/@SpaceX" target="_blank" rel="noopener noreferrer">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-youtube-icon lucide-youtube">
                                <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                                <path d="m10 15 5-3-5-3z" />
                            </svg>
                        </a>
                        <a className="link link-hover transition-transform transform hover:scale-125" href="https://x.com/SpaceX" target="_blank" rel="noopener noreferrer">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-twitter-icon lucide-twitter">
                                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                            </svg>
                        </a>
                    </div>
                </nav>
            </footer>
        </div>
    );
}
