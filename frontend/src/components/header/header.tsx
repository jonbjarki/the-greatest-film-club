import Link from "next/link";
import { Button } from "../ui/button";
import SignOutButton from "../auth/sign-out-button";
import { auth } from "@/../auth";
import ProfileIcon from "../profile/profile-icon";
import SignInButton from "../auth/sign-in-button";
import ProfileDropdown from "../profile/profile-dropdown";
import { Suspense } from "react";

export default async function Header() {
    const session = await auth();
    console.log(session);
    return (
        <header className="w-full h-18 overflow-hidden bg-accent">
            <div className="relative mx-auto max-w-3xl lg:max-w-6xl w-full h-full flex items-center justify-center gap-4 ">
                <span className="absolute right-4 ">
                    {session?.user && <Suspense><ProfileDropdown user={session?.user} /></Suspense>}
                    {!session?.user && <SignInButton />}
                </span>
            </div>
        </header>
    )
}