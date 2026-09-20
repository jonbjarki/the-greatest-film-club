import { MovieType } from "@/types/movie-types";
import MovieItem from "./movie-item";

async function fetchMovies() {
    const res = await fetch(process.env.API_URL + "/movies", {
        next: {
            tags: ["movies"]
        }
    });
    const data = await res.json();
    console.log("Received:", data);
    return data as MovieType[];
}

export default async function MovieList() {
    const movies = await fetchMovies();
    return (
        <ul className="mt-4 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-auto">
            {movies.map(movie => (
                <MovieItem key={movie.id} movie={movie} />
            ))}
        </ul>
    )
}