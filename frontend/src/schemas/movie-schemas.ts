import z from "zod";

export const movieVoteSchema = z.object({
    user_id: z.string(),
    username: z.string(),
    image_url: z.string().nullable(),
    created_at: z.coerce.date()
});

export const movieItemSchema = z.object({
    id: z.number(),
    name: z.string(),
    release_year: z.number().nullable(),
    genres: z.array(z.string()),
    director_names: z.array(z.string()),
    actor_names: z.array(z.string()),
    description: z.string().nullable(),
    backdrop_url: z.string().nullable(),
    poster_url: z.string().nullable(),
    votes: z.array(movieVoteSchema),
});


export const movieListSchema = z.array(movieItemSchema);

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
