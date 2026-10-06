"use client"
import { voteForMovie, unvoteForMovie } from "@/app/actions/movie";
import { Button } from "../ui/button";
import { useTransition } from "react";
import { toast } from "sonner";
import { MovieItemType } from "@/lib/schemas";

export default function VoteForm({ movieId, userVoted, handleClose, onVoted }: { movieId: number, userVoted: boolean, handleClose: () => void, onVoted: (movie: MovieItemType) => Promise<void> }) {
    const [isPending, startTransition] = useTransition();

    const handleVote = async () => {
        startTransition(async () => {
            const result = userVoted ? await unvoteForMovie(movieId) : await voteForMovie(movieId);

            if (!result) {
                toast.error("Failed to vote for movie");
            } else {
                toast.success("Vote successful");
                await onVoted(result);
                handleClose();
            }
        });
    };

    return (
        <div>
            {userVoted ?
                <Button type="button" disabled={isPending} variant="destructive" onClick={handleVote}>Unvote</Button>
                :
                <Button type="button" disabled={isPending} onClick={handleVote}>Vote</Button>}
        </div>
    )
}