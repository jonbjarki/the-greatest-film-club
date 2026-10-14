"use server"

import { authenticatedFetch } from "@/lib/auth"
import { clubInviteArraySchema, clubMetadataArraySchema, clubMetadataSchema, createClubSchema } from "@/schemas/club-schemas";
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
    redirect(`/clubs/view/${encodeURIComponent(newClub.normalized_name)}`)
}

export async function getClubsForUserAction() {

    const res = await authenticatedFetch(`/clubs/user`);
    if (!res.ok) {
        const error = await res.text();
        console.error("Error occurred while fetching clubs for user " + res.statusText, error)
        throw new Error("Error occurred while fetching clubs for user");
    }

    const data = clubMetadataArraySchema.parse(await res.json());
    return data;
}

export async function getActiveInvites() {
    const res = await authenticatedFetch("/clubs/invites");
    if (!res.ok) {
        const error = await res.text();
        console.error("Error occurred while fetching active invites " + res.statusText, error)
        throw new Error("Error occurred while fetching active invites");
    }

    const data = clubInviteArraySchema.parse(await res.json());
    return data;
}

export async function joinClubAction(clubId: number) {
    const res = await authenticatedFetch(`/clubs/${clubId}/join`, {
        method: "POST"
    });
    if (!res.ok) {
        if (res.status == 409) {
            throw new Error("You are already a member of this club");
        }
        if (res.status == 404) {
            throw new Error("Club not found");
        }
        if (res.status == 403) {
            throw new Error("You have not been invited to join this club");
        }
        const error = await res.text();
        console.error("Error occurred while joining club " + res.statusText, error)
        throw new Error("Error occurred while joining club");
    }
    const data = clubMetadataSchema.parse(await res.json());
    redirect(`/clubs/view/${encodeURIComponent(data.normalized_name)}`)
}