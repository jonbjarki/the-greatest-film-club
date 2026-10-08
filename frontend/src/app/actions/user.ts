"use server"

import { authenticatedFetch } from "@/lib/auth"
import { UpdateUserProfile, UserProfile, userProfileSchema } from "@/schemas/user-schemas";
import { updateTag } from "next/cache";

export async function getUserByName(username: string): Promise<UserProfile | null> {
    const res = await authenticatedFetch(`/users/${encodeURIComponent(username)}`, {
        next: {
            tags: [`user-${username}`]
        }
    })
    if (!res.ok) {
        if (res.status == 404) {
            return null;
        }

        throw new Error(`Failed to fetch user: ${res.statusText}`);
    }

    const user = await userProfileSchema.parseAsync(await res.json());
    return user;
}

type ErrorResponse = {
    errors: {
        username?: string;
    }
};

export async function updateProfileAction(data: UpdateUserProfile): Promise<UserProfile | ErrorResponse> {
    const res = await authenticatedFetch(`/users/me`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        if (res.status == 400) {
            const errorData = await res.json();
            if (errorData?.detail === "Username already taken") {
                return {
                    errors: {
                        "username": "Username already taken"
                    }
                }
            }
        }
        throw new Error(`Failed to update profile: ${res.statusText}`);
    }

    updateTag(`user-${data.username}`);
    updateTag(`user-me`);
    const user = await userProfileSchema.parseAsync(await res.json());
    return user;
}
