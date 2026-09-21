import { movieListResponseSchema } from "@/lib/schemas";
import MovieItem from "./movie-item";
import { authenticatedFetch } from "@/lib/auth";
import MovieListPagination from "./movie-list-pagination";

async function fetchMovies(page: number) {
    const url = new URL(process.env.API_URL + "/movies");
    url.searchParams.append("page", page.toString());
    const res = await authenticatedFetch(url, {
        next: {
            tags: ["movies"]
        }
    });

    const unvalidated = await res.json();
    const data = movieListResponseSchema.parse(unvalidated);
    console.log("Validated data:", data);
    return data;

}

export default async function MovieList({ page }: { page: number }) {
    const res = await fetchMovies(page);
    return (
        <>
            <ul className="mt-4 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-auto">
                {res.results.map(movie => (
                    <MovieItem key={movie.id} movie={movie} />
                ))}
            </ul>
            {res.total_pages > 1 && (
                <MovieListPagination page={page} totalPages={res.total_pages} />
            )}
        </>
    )
}