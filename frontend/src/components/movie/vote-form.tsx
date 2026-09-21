"use client"
import { voteForMovie, unvoteForMovie } from "@/app/actions/movie";
import { Button } from "../ui/button";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { redirect } from "next/navigation";

const initialState = {
    message: "",
    error: false
}

export default function VoteForm({ movieId, userVoted }: { movieId: number, userVoted: boolean }) {
    const voteAction = voteForMovie.bind(null, movieId);
    const unvoteAction = unvoteForMovie.bind(null, movieId);
    const [state, formAction, pending] = useActionState(userVoted ? unvoteAction : voteAction, initialState)
    useEffect(() => {
        if (state.message !== '') {
            if (state.error) {
                toast.error(state.message);
            }
            else {
                toast.success(state.message);
                redirect("/");
            }
        }
    }, [state.message])
    return (
        <form action={formAction}>
            {userVoted ? <Button type="submit" disabled={pending} variant="destructive">Unvote</Button> : <Button type="submit" disabled={pending}>Vote</Button>}
        </form>
    )
}