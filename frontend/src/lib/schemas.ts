import z from "zod";

export const passwordSchema = z
    .string()
    .min(6, { error: "Password must be at least 6 characters long." })
    // Check for at least one uppercase letter
    .refine((val) => /[A-Z]/.test(val), {
        message: "Password must contain at least one uppercase letter.",
    })
    // Check for at least one lowercase letter
    .refine((val) => /[a-z]/.test(val), {
        message: "Password must contain at least one lowercase letter.",
    })
    // Check for at least one number
    .refine((val) => /[0-9]/.test(val), {
        message: "Password must contain at least one number.",
    })


export const credentialsSchema = z.object({
    username: z.string().min(4, { error: "Username must be at least 4 characters long" }),
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

export const movieItemSchema = z.object({
    id: z.number(),
    name: z.string(),
    release_year: z.number(),
    genres: z.array(z.string()),
    director_names: z.array(z.string()),
    actor_names: z.array(z.string()),
    description: z.string(),
    backdrop_url: z.string(),
    poster_url: z.string(),
    user_id: z.number(),
    added_at: z.coerce.date(),
    added_by: z.string(),
    vote_count: z.number(),
    user_voted: z.boolean()
});

export const movieListResponseSchema = z.object({
    results: z.array(movieItemSchema),
    page: z.number(),
    total_pages: z.number(),
    total_results: z.number()
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
export type MovieItemType = z.infer<typeof movieItemSchema>;
export type MovieListResponseType = z.infer<typeof movieListResponseSchema>;