"use server"

import { authenticatedFetch } from "@/lib/auth"
import { movieSearchResponseSchema } from "@/schemas/movie-schemas";

export async function searchForMovie(query: string) {
    const res = await authenticatedFetch(`/movie-nights/search?query=${encodeURIComponent(query)}`);
    if (!res.ok) {
        throw new Error(`Failed to search for movies: ${res.statusText}`);
    }
    return movieSearchResponseSchema.parse(await res.json());
}
