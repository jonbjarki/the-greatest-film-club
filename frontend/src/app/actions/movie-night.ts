"use server"

import { authenticatedFetch } from "@/lib/auth"
import { createMovieNightSchema, movieNightListSchema } from "@/schemas/movie-night-schemas";
import { MovieItemType, movieItemSchema, movieListSchema } from "@/schemas/movie-schemas";
import { updateTag } from "next/cache";
import { auth } from "@/../auth";
import { title } from "process";

export type CreateMovieNightActionState = {
    message?: string,
    success: boolean,
    errors?: {
        name?: string[],
        description?: string[],
        deadline?: string[]
    }
}

export async function createMovieNightAction(_prevState: CreateMovieNightActionState, formData: FormData, clubId: number): Promise<CreateMovieNightActionState> {
    void _prevState;
    const session = await auth();
    if (!session) return { message: "Not authenticated", success: false };

    const user = session?.user
    const data = createMovieNightSchema.parse({
        title: formData.get("title")?.toString() ?? "",
        description: formData.get("description")?.toString() ?? null,
        deadline: formData.get("deadline")?.toString() ?? null,
        club_id: clubId
    });

    const res = await authenticatedFetch(`/movie-nights`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!res.ok) {
        if (res.status == 400) {
            return { success: false, errors: await res.json() };
        }
        console.error("Failed to create movie night", await res.text());
        return { message: "Failed to create movie night, try again later", success: false };
    }

    return { message: "Movie night created", success: true };
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
    movieItemSchema.parse(await res.json());
    updateTag(`movie-night-${movieNightId}`);
    return { message: "Movie added", error: false };
}
