"use server"

import { authenticatedFetch } from "@/lib/auth"
import { updateTag } from "next/cache";
import { MovieItemType, movieListResponseSchema, movieSearchResponseSchema } from "@/lib/schemas";

export type MovieActionState = {
    message: string,
    error: boolean,
}

export async function voteForMovie(movieId: number): Promise<MovieItemType> {
    const res = await authenticatedFetch(`/movies/${movieId}/vote`, {
        method: "POST"
    });

    if (!res.ok) {
        throw new Error(`Failed to vote for movie: ${res.statusText}`);
    }

    updateTag("movies");
    return await res.json() as MovieItemType;
}

export async function unvoteForMovie(movieId: number): Promise<MovieItemType> {
    const res = await authenticatedFetch(`/movies/${movieId}/unvote`, {
        method: "POST"
    });

    if (!res.ok) {
        throw new Error(`Failed to unvote for movie: ${res.statusText}`);
    }

    updateTag("movies");
    return await res.json() as MovieItemType;
}
export async function searchForMovie(query: string) {
    const res = await authenticatedFetch(`/movies/tmdb/search?query=${encodeURIComponent(query)}`);
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
    const res = await authenticatedFetch(`/movies/${movieId}`, {
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

export async function fetchMoviesAction(page: number) {
    const url = `/movies?page=${page}`;
    const res = await authenticatedFetch(url, {
        next: {
            tags: ["movies"]
        }
    });

    if (!res.ok) {
        console.error("Failed to fetch movies", await res.text());
        throw new Error(`Failed to fetch movies: ${res.statusText}`);
    }

    const unvalidated = await res.json();
    const data = movieListResponseSchema.parse(unvalidated);
    return { ...data, hasNext: data.page < data.total_pages }

}