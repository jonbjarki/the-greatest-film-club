"use client"
import { voteForMovie, unvoteForMovie } from "@/app/actions/movie";
import { Button } from "../ui/button";
import { useTransition } from "react";
import { toast } from "sonner";
import { MovieItemType } from "@/schemas/movie-schemas";

export default function VoteForm({ movieNightId, movieId, userVoted, handleClose }: { movieNightId: number, movieId: number, userVoted: boolean, handleClose: () => void }) {
    const [isPending, startTransition] = useTransition();

    const handleVote = async () => {
        startTransition(async () => {
            const result = userVoted ? await unvoteForMovie(movieNightId, movieId) : await voteForMovie(movieNightId, movieId);

            if (!result.success) {
                toast.error(result.message);
            } else {
                if (userVoted) {
                    toast.success("Successfully removed vote");
                } else {
                    toast.success("Vote successful");
                }
                handleClose();
            }
        });
    };

    return (
        <div className="w-fit self-end">
            {userVoted ?
                <Button type="button" disabled={isPending} variant="destructive" onClick={handleVote}>Unvote</Button>
                :
                <Button type="button" disabled={isPending} onClick={handleVote}>Vote</Button>}
        </div>
    )
}