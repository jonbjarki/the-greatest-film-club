"use server"

import { authenticatedFetch } from "@/lib/auth"
import { MovieItemType, movieSearchResponseSchema } from "@/schemas/movie-schemas";
import { updateTag } from "next/cache";

export async function searchForMovie(query: string) {
    const res = await authenticatedFetch(`/movie-nights/search?query=${encodeURIComponent(query)}`);
    if (!res.ok) {
        throw new Error(`Failed to search for movies: ${res.statusText}`);
    }
    return movieSearchResponseSchema.parse(await res.json());
}




export type VoteResult = { success: true } | { success: false, message: string };

export async function voteForMovie(movieNightId: number, movieId: number): Promise<VoteResult> {
    const res = await authenticatedFetch(`/movie-nights/${movieNightId}/movies/${movieId}/vote`, {
        method: "POST"
    });

    if (!res.ok) {
        if (res.status == 403) {
            const { detail } = await res.json().catch(() => ({ detail: null }));
            return { success: false, message: detail ?? "You can't vote in this movie night" };
        }
        throw new Error(`Failed to vote for movie: ${res.statusText}`);
    }

    updateTag("movies");
    return { success: true };
}

export async function unvoteForMovie(movieNightId: number, movieId: number): Promise<VoteResult> {
    const res = await authenticatedFetch(`/movie-nights/${movieNightId}/movies/${movieId}/vote`, {
        method: "DELETE"
    });

    if (!res.ok) {
        if (res.status == 403) {
            const { detail } = await res.json().catch(() => ({ detail: null }));
            return { success: false, message: detail ?? "You can't unvote in this movie night" };
        }
        throw new Error(`Failed to unvote for movie: ${res.statusText}`);
    }

    updateTag("movies");
    return { success: true };
}