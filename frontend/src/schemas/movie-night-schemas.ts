import { z } from "zod";

export const movieNightSchema = z.object({
    id: z.number(),
    title: z.string(),
    normalized_title: z.string(),
    club_id: z.number(),
    description: z.string().nullish(),
    deadline: z.string().nullish(),
});

export const TITLE_MIN_LENGTH = 4
export const TITLE_MAX_LENGTH = 40
export const DESCRIPTION_MIN_LENGTH = 4
export const DESCRIPTION_MAX_LENGTH = 200

// Empty form fields come through as "", which the backend expects as null
const emptyToNull = (value: unknown) => typeof value === "string" && value.trim() === "" ? null : value;

export const createMovieNightSchema = z.object({
    club_id: z.number(),
    title: z.string()
        .trim()
        .min(TITLE_MIN_LENGTH, { error: `Title must be at least ${TITLE_MIN_LENGTH} characters.` })
        .max(TITLE_MAX_LENGTH, { error: `Title must be at most ${TITLE_MAX_LENGTH} characters.` }),
    description: z.preprocess(emptyToNull, z.string()
        .trim()
        .min(DESCRIPTION_MIN_LENGTH, { error: `Description must be at least ${DESCRIPTION_MIN_LENGTH} characters.` })
        .max(DESCRIPTION_MAX_LENGTH, { error: `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters.` })
        .nullable()),
    // ISO 8601 string, converted from the user's local time on the client
    deadline: z.preprocess(emptyToNull, z.iso.datetime({ offset: true, error: "Deadline must be a valid date and time." })
        .refine((value) => new Date(value) > new Date(), { error: "Deadline must be in the future." })
        .nullable()),
});

/** Mirrors the backend's title normalization, used to build movie night URLs. */
export function normalizeMovieNightTitle(title: string) {
    return title.replace(/ /g, "-").toLowerCase();
}

export const movieNightListSchema = z.array(movieNightSchema);

export type MovieNight = z.infer<typeof movieNightSchema>;
export type MovieNightList = z.infer<typeof movieNightListSchema>;
