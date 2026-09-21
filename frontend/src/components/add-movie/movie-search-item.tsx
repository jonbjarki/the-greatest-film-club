import { MovieSearchItemType } from "@/lib/schemas";
import { Button } from "../ui/button";

export default function MovieSearchItem({ movie, pending }: { movie: MovieSearchItemType, pending: boolean }) {
    return (
        <Button key={movie.id} type="submit" name="movieId" value={movie.id.toString()} variant="outline" className="bg-background p-2 m-1 w-full justify-start" disabled={pending}>{movie.title} ({movie.release_year}) </Button>
    )
}