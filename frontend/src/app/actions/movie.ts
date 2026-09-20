"use server"

import { authenticatedFetch } from "@/lib/auth"
import { updateTag } from "next/cache";

export async function voteForMovie(movieId: number, initialState: any, formData: FormData) {
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