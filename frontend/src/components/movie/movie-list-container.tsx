import MovieList from "./movie-list";
import { fetchMoviesAction } from "@/app/actions/movie";
import { Suspense } from "react";

export default async function MovieListContainer() {
    const initialMovies = await fetchMoviesAction(1);
    return (
        <Suspense>
            <MovieList initialMovies={initialMovies.results} initialHasNext={initialMovies.hasNext} />
        </Suspense>
    )
}