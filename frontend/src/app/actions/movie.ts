"use server"

import { authenticatedFetch } from "@/lib/auth"
import { updateTag } from "next/cache";
import { movieSearchResponseSchema } from "@/lib/schemas";

export type MovieActionState = {
    message: string,
    error: boolean,
}

export async function voteForMovie(movieId: number, _initialState: MovieActionState, _formData: FormData): Promise<MovieActionState> {
    void _initialState;
    void _formData;
    const res = await authenticatedFetch(process.env.API_URL + `/movies/${movieId}/vote`, {
        method: "POST"
    });

    if (!res.ok) {
        if (res.status === 409) {
            return { message: "You have already voted for this movie.", error: true };
        }
        throw new Error(`Failed to vote for movie: ${res.statusText}`);
    }
    updateTag("movies");
    return { message: "Vote submitted", error: false };
}

export async function unvoteForMovie(movieId: number): Promise<MovieActionState> {
    const res = await authenticatedFetch(process.env.API_URL + `/movies/${movieId}/unvote`, {
        method: "POST"
    });

    if (!res.ok) {
        throw new Error(`Failed to unvote for movie: ${res.statusText}`);
    }

    updateTag("movies");
    return { message: "Vote removed", error: false };
}
export async function searchForMovie(query: string) {
    const res = await authenticatedFetch(process.env.API_URL + `/movies/tmdb/search?query=${encodeURIComponent(query)}`);
    if (!res.ok) {
        throw new Error(`Failed to search for movies: ${res.statusText}`);
    }
    const unvalidated = await res.json()
    const parsed = movieSearchResponseSchema.parse(unvalidated);
    return parsed;
}

export async function addMovie(_prevState: MovieActionState, formData: FormData): Promise<MovieActionState> {
    void _prevState;
    const movieId = Number(formData.get("movieId"));
    const res = await authenticatedFetch(process.env.API_URL + `/movies/${movieId}`, {
        method: "POST"
    });

    if (!res.ok) {
        if (res.status == 409) {
            return { message: "Movie already added", error: true };
        }
        throw new Error(`Failed to add movie: ${res.statusText}`);
    }
    updateTag("movies");
    return { message: "Movie added", error: false };
}