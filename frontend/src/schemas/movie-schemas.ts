import z from "zod";

export const voteUserSchema = z.object({
    id: z.string(),
    username: z.string(),
    image_url: z.string().nullable()
});

export const movieItemSchema = z.object({
    id: z.number(),
    name: z.string(),
    release_year: z.number(),
    genres: z.array(z.string()),
    director_names: z.array(z.string()),
    actor_names: z.array(z.string()),
    description: z.string(),
    backdrop_url: z.string().nullable(),
    poster_url: z.string().nullable(),
    user_id: z.string(),
    added_at: z.coerce.date(),
    added_by: z.string(),
    vote_count: z.number(),
    user_voted: z.boolean(),
    voted_users: z.array(voteUserSchema),
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

export type MovieSearchItemType = z.infer<typeof movieSearchItemSchema>;
export type MovieSearchResponseType = z.infer<typeof movieSearchResponseSchema>;
export type MovieItemType = z.infer<typeof movieItemSchema>;
export type MovieListResponseType = z.infer<typeof movieListResponseSchema>;
