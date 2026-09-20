import z from "zod";

export const passwordSchema = z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." })

export const credentialsSchema = z.object({
    username: z.string().min(4),
    password: passwordSchema
})

export const loginResponseSchema = z.object({
    user: z.object({
        id: z.string(),
        username: z.string(),
        email: z.string().optional(),
    }),
    access_token: z.string(),
    token_type: z.string(),
    expires_in: z.number()
});


export const movieSearchItemSchema = z.object({
    id: z.number(),
    title: z.string(),
    release_year: z.number().nullable(),
});

export const movieSearchResponseSchema = z.object({
    results: z.array(movieSearchItemSchema)
});

export type Credentials = z.infer<typeof credentialsSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type MovieSearchItemType = z.infer<typeof movieSearchItemSchema>;
export type MovieSearchResponseType = z.infer<typeof movieSearchResponseSchema>;