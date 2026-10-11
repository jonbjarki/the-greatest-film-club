import { z } from "zod";

export const movieNightSchema = z.object({
    id: z.number(),
    title: z.string(),
    normalized_title: z.string(),
    club_id: z.number(),
    description: z.string().nullish(),
    deadline: z.string().nullish(),
});

export const createMovieNightSchema = z.object({
    club_id: z.number(),
    title: z.string(),
    description: z.string().nullish(),
    deadline: z.string().nullish(),
});

export const movieNightListSchema = z.array(movieNightSchema);

export type MovieNight = z.infer<typeof movieNightSchema>;
export type MovieNightList = z.infer<typeof movieNightListSchema>;
