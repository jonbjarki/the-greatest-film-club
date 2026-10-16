"use server"

import { authenticatedFetch } from "@/lib/auth"
import { clubInviteArraySchema, clubMemberArraySchema, clubMetadataArraySchema, clubMetadataSchema, ClubRole, createClubSchema, inviteUserSchema } from "@/schemas/club-schemas";
import { updateTag } from "next/cache";
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

export async function getClubMembersAction(clubId: number) {
    const res = await authenticatedFetch(`/clubs/club/${clubId}/members`, {
        next: { tags: [`club-${clubId}-members`] }
    });
    if (!res.ok) {
        if (res.status == 404) {
            return [];
        }
        const error = await res.text();
        console.error("Error occurred while fetching club members " + res.statusText, error)
        throw new Error("Error occurred while fetching club members");
    }

    const data = clubMemberArraySchema.parse(await res.json());
    return data;
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

// Returns the error instead of throwing it: Next.js hides thrown server action messages in production
export async function joinClubAction(clubId: number): Promise<{ error: string }> {
    const res = await authenticatedFetch(`/clubs/${clubId}/join`, {
        method: "POST"
    });
    if (!res.ok) {
        if (res.status == 409) {
            return { error: "You are already a member of this club" };
        }
        if (res.status == 404) {
            return { error: "Club not found" };
        }
        if (res.status == 403) {
            return { error: "You have not been invited to join this club" };
        }
        const error = await res.text();
        console.error("Error occurred while joining club " + res.statusText, error)
        return { error: "Couldn't accept invite, try again later" };
    }
    const data = clubMetadataSchema.parse(await res.json());
    redirect(`/clubs/view/${encodeURIComponent(data.normalized_name)}`)
}

/** Reads FastAPI's `{ detail: "..." }` error message, if the response has one. */
async function getErrorDetail(res: Response): Promise<string | null> {
    try {
        const body = await res.json();
        return typeof body.detail === "string" ? body.detail : null;
    } catch {
        return null;
    }
}

export interface InviteUserActionState {
    errors?: {
        username?: string[];
    }
    message?: string,
    success: boolean
}

export async function inviteUserAction(clubId: number, _prevState: InviteUserActionState, formData: FormData): Promise<InviteUserActionState> {
    void _prevState;
    const validation = inviteUserSchema.safeParse({ username: formData.get("username") ?? "" });

    if (!validation.success) {
        return {
            errors: flattenError(validation.error).fieldErrors,
            success: false
        };
    }

    const { username } = validation.data;
    const res = await authenticatedFetch(`/clubs/${clubId}/invite/${encodeURIComponent(username)}`, {
        method: "POST"
    });

    if (!res.ok) {
        const detail = await getErrorDetail(res);
        if (res.status == 404) {
            if (detail === "User not found") {
                return { errors: { username: [`No user named "${username}" exists.`] }, success: false };
            }
            return { message: "This club no longer exists.", success: false };
        }
        if (res.status == 403) {
            return { message: "Only club admins and owners can invite users.", success: false };
        }
        if (res.status == 409) {
            return { errors: { username: [detail ?? "This user is already in the club."] }, success: false };
        }
        console.error("Error occurred while inviting user " + res.statusText, detail)
        return { message: "Failed to send invite, try again later", success: false };
    }

    updateTag(`club-${clubId}-members`);

    return { message: `Invite sent to ${username}`, success: true };
}

// Returns the error instead of throwing it: Next.js hides thrown server action messages in production
export async function leaveClubAction(clubId: number): Promise<{ error: string }> {
    const res = await authenticatedFetch(`/clubs/${clubId}/leave`, {
        method: "DELETE"
    });
    if (!res.ok) {
        const detail = await getErrorDetail(res);
        if (res.status == 400) {
            return { error: detail ?? "You can't leave this club" };
        }
        if (res.status == 404) {
            return { error: "Club not found" };
        }
        console.error("Error occurred while leaving club " + res.statusText, detail)
        return { error: "Failed to leave club, try again later" };
    }
    redirect("/clubs");
}

/** Shared error handling for the owner's member-management requests. */
async function memberManagementError(res: Response, actionDescription: string): Promise<{ error: string }> {
    const detail = await getErrorDetail(res);
    if ((res.status == 400 || res.status == 403 || res.status == 404) && detail) {
        return { error: detail };
    }
    console.error(`Error occurred while ${actionDescription} ` + res.statusText, detail)
    return { error: `Failed ${actionDescription}, try again later` };
}

export async function updateMemberRoleAction(clubId: number, userId: string, role: Exclude<ClubRole, "owner">): Promise<{ error?: string }> {
    const res = await authenticatedFetch(`/clubs/${clubId}/members/${encodeURIComponent(userId)}/role`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ role })
    });
    if (!res.ok) {
        return memberManagementError(res, "changing role");
    }
    updateTag(`club-${clubId}-members`);
    return {};
}

export async function kickMemberAction(clubId: number, userId: string): Promise<{ error?: string }> {
    const res = await authenticatedFetch(`/clubs/${clubId}/members/${encodeURIComponent(userId)}`, {
        method: "DELETE"
    });
    if (!res.ok) {
        return memberManagementError(res, "removing member");
    }
    updateTag(`club-${clubId}-members`);
    return {};
}
