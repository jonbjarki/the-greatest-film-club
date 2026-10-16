import { MovieItemType } from "@/schemas/movie-schemas";
import MovieItem from "./movie-item";

export default function MovieList({ movies, movieNightId, user_id }: { movies: MovieItemType[], movieNightId: number, user_id: string }) {
    if (movies.length === 0) {
        return <p className="text-muted-foreground">No movies have been added yet.</p>;
    }

    return (
        <ul className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-auto">
            {movies.map(movie => (
                <MovieItem key={movie.id} movie={movie} movieNightId={movieNightId} user_id={user_id} />
            ))}
        </ul>
    )
}
