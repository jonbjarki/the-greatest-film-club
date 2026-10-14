"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
    { href: "/clubs", label: "Clubs" }
]

export default function Navbar() {
    const pathname = usePathname();
    return (
        <nav>
            {links.map(({ href, label }) => (
                <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={`hover:underline underline-offset-2 ${pathname === href ? "text-primary underline" : ""}`}>
                    {label}
                </Link>
            ))}
        </nav>
    )
}