import { z } from "zod";
import { userProfileSchema } from "./user-schemas";

export const DESCRIPTION_MAX_LENGTH = 255
export const NAME_MAX_LENGTH = 50
export const NAME_MIN_LENGTH = 4

export const clubMetadataSchema = z.object({
    id: z.number(),
    name: z.string(),
    normalized_name: z.string(),
    description: z.string().nullable(),
    member: z.object({
        role: z.enum(["member", "admin", "owner"]),
        status: z.enum(["active", "invited"]),
        invited_at: z.coerce.date().nullable(),
        joined_at: z.coerce.date().nullable(),
        club_id: z.number(),
        user_id: z.string(),
    }).optional(),
});

export const clubMetadataArraySchema = z.array(clubMetadataSchema);

export const clubInviteSchema = z.object({
    club_id: z.number(),
    user_id: z.string(),
    invited_at: z.coerce.date(),
    name: z.string(),
});
export const clubInviteArraySchema = z.array(clubInviteSchema);

export const createClubSchema = z.object({
    name: z.string()
        .min(NAME_MIN_LENGTH, { error: `Name must be at least ${NAME_MIN_LENGTH} characters.` })
        .max(NAME_MAX_LENGTH, { error: `Name must be at most ${NAME_MAX_LENGTH} characters.` })
        .refine((value) => /^[a-zA-Z0-9 ]+$/.test(value), { error: "Name can only contain alphanumeric characters and spaces." }),
    description: z.string().max(DESCRIPTION_MAX_LENGTH, { error: `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters.` }).nullable(),
})

export const USERNAME_MAX_LENGTH = 20

export const inviteUserSchema = z.object({
    username: z.string()
        .trim()
        .min(1, { error: "Enter a username." })
        .max(USERNAME_MAX_LENGTH, { error: `Usernames are at most ${USERNAME_MAX_LENGTH} characters.` }),
});

export const clubRoleSchema = z.enum(["member", "admin", "owner"]);
export const clubMemberStatus = z.enum(["active", "invited"]);

export const clubMemberSchema = z.object({
    club_id: z.number(),
    role: clubRoleSchema,
    status: clubMemberStatus,
    invited_at: z.coerce.date().nullable(),
    joined_at: z.coerce.date().nullable(),
    user: userProfileSchema,
});
export const clubMemberArraySchema = z.array(clubMemberSchema);

export const clubUserSchema = z.object({
    club_id: z.number(),
    user_id: z.number(),
    role: clubRoleSchema,
    status: clubMemberStatus,
    invited_at: z.coerce.date().nullable(),
    joined_at: z.coerce.date().nullable()
});


export type ClubMetadata = z.infer<typeof clubMetadataSchema>;
export type ClubMetadataArray = z.infer<typeof clubMetadataArraySchema>;

export type ClubInvite = z.infer<typeof clubInviteSchema>;

export type ClubRole = z.infer<typeof clubRoleSchema>;
export type ClubMember = z.infer<typeof clubMemberSchema>;