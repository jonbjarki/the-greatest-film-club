"use client"
import { voteForMovie } from "@/app/actions/movie";
import { Button } from "../ui/button";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

const initialState = {
    message: "",
    error: false
}

export default function VoteForm({ movieId, closeDialog }: { movieId: number, closeDialog: () => void }) {
    const voteAction = voteForMovie.bind(null, movieId);
    const [state, formAction, pending] = useActionState(voteAction, initialState)
    useEffect(() => {
        if (state.message !== '') {
            if (state.error) {
                toast.error(state.message);
            }
            else {
                closeDialog();
                toast.success(state.message);
            }
        }
    }, [state.message])
    return (
        <form action={formAction}>
            <Button type="submit">Vote</Button>
        </form>
    )
}