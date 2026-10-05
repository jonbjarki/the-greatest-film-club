import Link from "next/link";
import { Button } from "../ui/button";
import SignOutButton from "../auth/sign-out-button";
import { auth } from "@/../auth";
import ProfileIcon from "../profile/profile-icon";
import SignInButton from "../auth/sign-in-button";
import ProfileDropdown from "../profile/profile-dropdown";
import { Suspense } from "react";
import { Session } from "next-auth";
import { authenticatedFetch } from "@/lib/auth";
import { userProfileSchema } from "@/lib/schemas";

async function getMe() {
    const res = await authenticatedFetch("/users/me")
    if (!res.ok) {
        throw new Error("Failed to fetch user data");
    }
    const data = await userProfileSchema.parseAsync(await res.json());
    return data;
}

export default async function Header() {
    const user = await getMe();
    return (
        <header className="w-full h-18 overflow-hidden bg-accent">
            <div className="relative mx-auto max-w-3xl lg:max-w-6xl w-full h-full flex items-center justify-center gap-4 ">
                <Link href="/">
                    <h1 className="text-2xl font-heading font-bold text-primary">TGFC</h1>
                </Link>
                <span className="absolute right-4 ">
                    {user && <Suspense><ProfileDropdown user={user} /></Suspense>}
                    {!user && <SignInButton />}
                </span>
            </div>
        </header>
    )
}