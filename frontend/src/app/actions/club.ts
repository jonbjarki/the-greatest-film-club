"use server"

import { authenticatedFetch } from "@/lib/auth"
import { clubMetadataSchema, createClubSchema } from "@/schemas/club-schemas";
import { redirect } from "next/navigation";
import { flattenError } from "zod";

export async function getClubByNameAction(name: string) {
    const res = await authenticatedFetch(`/clubs/name/${name}`)

    if (!res.ok) {
        if (res.status == 404) {
            return null;
        }
        const error = await res.text();
        console.error("Error occurred while fetching club " + res.statusText, error)
        throw new Error("Error occurred while fetching club " + name);
    }

    const data = clubMetadataSchema.parse(await res.json());
    return data;
}

export interface CreateClubActionState {
    errors?: {
        name?: string[];
        description?: string[];
    }
    message?: string,
    success: boolean
}

export async function createClubAction(prevState: CreateClubActionState, formData: FormData) {
    const validation = createClubSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validation.success) {
        return {
            errors: flattenError(validation.error).fieldErrors,
            success: false
        };
    }

    const validatedData = validation.data;

    const res = await authenticatedFetch(`/clubs/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(validatedData)
    });

    if (!res.ok) {
        if (res.status == 409) {
            return {
                errors: {
                    name: ["A club with this name already exists."]
                },
                success: false
            }
        }
        const error = await res.text();
        console.error("Error occurred when creating club " + res.statusText, error)
        return {
            message: "Failed to create club, try again later",
            success: false
        }
    }
    const responseData = await res.json();
    const newClub = clubMetadataSchema.parse(responseData);
    redirect(`/club/view/${encodeURIComponent(newClub.normalized_name)}`)
}
