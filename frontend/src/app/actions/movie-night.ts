"use server"

import { authenticatedFetch } from "@/lib/auth"
import { createMovieNightSchema, movieNightListSchema, movieNightSchema, normalizeMovieNightTitle } from "@/schemas/movie-night-schemas";
import { MovieItemType, movieItemSchema, movieListSchema } from "@/schemas/movie-schemas";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { flattenError } from "zod";

export interface CreateMovieNightActionState {
    errors?: {
        title?: string[],
        description?: string[],
        deadline?: string[]
    }
    message?: string,
    success: boolean
}

/** Maps FastAPI 422 validation errors ({ detail: [{ loc: ["body", field], msg }] }) to form field errors. */
async function parseValidationErrors(res: Response): Promise<CreateMovieNightActionState["errors"] | null> {
    try {
        const body = await res.json();
        const errors: NonNullable<CreateMovieNightActionState["errors"]> = {};
        for (const detail of body.detail ?? []) {
            const field: unknown = detail.loc?.at(-1);
            if (field === "title" || field === "description" || field === "deadline") {
                (errors[field] ??= []).push(detail.msg);
            }
        }
        return Object.keys(errors).length > 0 ? errors : null;
    } catch {
        return null;
    }
}

export async function createMovieNightAction(clubId: number, clubNormalizedName: string, _prevState: CreateMovieNightActionState, formData: FormData): Promise<CreateMovieNightActionState> {
    void _prevState;
    const validation = createMovieNightSchema.safeParse({
        title: formData.get("title") ?? "",
        description: formData.get("description"),
        deadline: formData.get("deadline"),
        club_id: clubId
    });

    if (!validation.success) {
        return {
            errors: flattenError(validation.error).fieldErrors,
            success: false
        };
    }

    const validatedData = validation.data;

    // The backend doesn't enforce unique titles, but movie nights are routed by normalized title
    const existing = await getMovieNightsAction(clubId);
    const normalizedTitle = normalizeMovieNightTitle(validatedData.title);
    if (existing.some((movieNight) => movieNight.normalized_title === normalizedTitle)) {
        return {
            errors: { title: ["This club already has a movie night with this title."] },
            success: false
        };
    }

    const res = await authenticatedFetch(`/movie-nights/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(validatedData)
    });

    if (!res.ok) {
        if (res.status == 403) {
            return { message: "Only active club admins and owners can create movie nights.", success: false };
        }
        if (res.status == 404) {
            return { message: "This club no longer exists.", success: false };
        }
        if (res.status == 409) {
            return {
                errors: { title: ["This club already has a movie night with this title."] },
                success: false
            };
        }
        if (res.status == 422) {
            const errors = await parseValidationErrors(res);
            if (errors) {
                return { errors, success: false };
            }
            return { message: "Some of the movie night details are invalid.", success: false };
        }
        const error = await res.text();
        console.error("Error occurred when creating movie night " + res.statusText, error)
        return { message: "Failed to create movie night, try again later", success: false };
    }

    const newMovieNight = movieNightSchema.parse(await res.json());
    redirect(`/clubs/view/${encodeURIComponent(clubNormalizedName)}/movie-nights/${encodeURIComponent(newMovieNight.normalized_title)}`);
}


export async function getMovieNightsAction(clubId: number) {
    const res = await authenticatedFetch(`/movie-nights/club/${clubId}`);
    if (!res.ok) {
        if (res.status == 404) return [];
        console.error(await res.text());
        throw new Error("Failed to fetch movie nights " + res.statusText);
    }
    return movieNightListSchema.parse(await res.json());
}

export async function getMovieNightByTitleAction(clubId: number, normalizedTitle: string) {
    const movieNights = await getMovieNightsAction(clubId);
    return movieNights.find(mn => mn.normalized_title === normalizedTitle) ?? null;
}

export async function getMovieNightMoviesAction(movieNightId: number): Promise<MovieItemType[]> {
    const res = await authenticatedFetch(`/movie-nights/${movieNightId}/movies`, {
        next: { tags: [`movie-night-${movieNightId}`] }
    });
    if (!res.ok) {
        console.error(await res.text());
        throw new Error("Failed to fetch movies for movie night " + res.statusText);
    }
    return movieListSchema.parse(await res.json());
}

export type AddMovieActionState = {
    message: string,
    error: boolean,
}

export async function addMovieToMovieNightAction(_prevState: AddMovieActionState, formData: FormData): Promise<AddMovieActionState> {
    void _prevState;
    const movieId = Number(formData.get("movieId"));
    const movieNightId = Number(formData.get("movieNightId"));
    if (!Number.isInteger(movieId) || !Number.isInteger(movieNightId)) {
        return { message: "Invalid movie", error: true };
    }

    const res = await authenticatedFetch(`/movie-nights/${movieNightId}/movies?movie_id=${movieId}`, {
        method: "POST"
    });

    if (!res.ok) {
        if (res.status == 409) {
            return { message: "Movie already added to this movie night", error: true };
        }
        if (res.status == 403) {
            return { message: "Only club admins can add movies", error: true };
        }
        console.error("Failed to add movie", await res.text());
        return { message: "Failed to add movie, try again later", error: true };
    }
    updateTag(`movie-night-${movieNightId}`);
    return { message: "Movie added", error: false };
}
