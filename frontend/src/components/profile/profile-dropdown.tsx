"use client"

import { User } from "next-auth";
import { signOut } from "next-auth/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuPortal, DropdownMenuLabel } from "../ui/dropdown-menu";
import ProfileIcon from "./profile-icon";
import { Button } from "../ui/button";
import Link from "next/link";
import { UserProfile } from "@/schemas/user-schemas";

export default function ProfileDropdown({ user }: { user: UserProfile }) {
    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <button className="rounded-full">
                    <ProfileIcon user={user} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-20" align="start">
                <DropdownMenuLabel className="text-xs font-light">
                    Signed in as {user.username}
                </DropdownMenuLabel>
                <DropdownMenuItem asChild>
                    <Link href={`/profile/${user.username}`} className="w-full cursor-pointer">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" asChild>
                    <button onClick={() => signOut()} className="w-full cursor-pointer">Sign out</button>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu >
    )
}