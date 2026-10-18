import z from "zod";

export const userProfileSchema = z.object({
    id: z.string(),
    username: z.string(),
    image_url: z.string().nullable(),
    bio: z.string().nullable(),
    created_at: z.coerce.date(),
});

export const updateUserProfileSchema = z.object({
    username: z.string().min(4, { error: "Username must be at least 4 characters long" }).nullish(),
    image_url: z.string().nullish(),
    bio: z.string().min(20, { error: "Bio must be at least 20 characters long" }).max(300, { error: "Bio must be at most 300 characters long" }).nullish(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;