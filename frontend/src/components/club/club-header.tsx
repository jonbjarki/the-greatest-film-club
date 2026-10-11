"use client"

import { getClubByNameAction } from "@/app/actions/club"
import { useParams } from "next/navigation"
import { use } from "react"

export default function ClubHeader() {
    const { name } = useParams();
    const clubPromise = getClubByNameAction.bind(null, name as string);
    const club = use(clubPromise());
    if (!club) return null;
    return (
        <h1 className="text-3xl font-medium text-center mb-4">{club.name}</h1>
    )
}