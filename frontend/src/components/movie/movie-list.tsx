"use client"

import { MovieItemType } from "@/lib/schemas";
import MovieItem from "./movie-item";
import { useEffect, useRef, useState } from "react";
import { fetchMoviesAction } from "@/app/actions/movie";
import { Spinner } from "../ui/spinner";

export default function MovieList({ initialMovies, initialHasNext }: { initialMovies: MovieItemType[], initialHasNext: boolean }) {
    const [movies, setMovies] = useState<MovieItemType[]>(initialMovies);
    const [pageNumber, setPageNumber] = useState(1);
    const [hasNext, setHasNext] = useState(initialHasNext);
    const [loading, setLoading] = useState(false);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    // Update voted movie
    async function refreshMovie(movie: MovieItemType) {
        setMovies(prev => prev.map(m => m.id === movie.id ? movie : m));
    }

    useEffect(() => {
        async function loadMoreMovies(pageNumber: number) {
            if (loading || !hasNext) return;

            setLoading(true);
            const response = await fetchMoviesAction(pageNumber);

            setMovies(prev => [...prev, ...response.results]);
            setHasNext(response.hasNext);
            setPageNumber(response.page);
            setLoading(false);
        }

        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                observer.unobserve(entries[0].target);
                loadMoreMovies(pageNumber + 1);
            }
        })

        const element = loadMoreRef.current

        if (element) {
            observer.observe(element)
        }

        return () => {
            if (element) {
                observer.unobserve(element)
            }
        }
    }, [pageNumber, hasNext])


    return (
        <>
            <ul className="mt-4 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-auto">
                {movies.map(movie => (
                    <MovieItem key={movie.id} movie={movie} onVoted={refreshMovie} />
                ))}
                {loading && <span className="col-span-full flex justify-center">
                    <Spinner className="size-8" />
                </span>}
                <div className="h-4" ref={loadMoreRef} />
            </ul>

        </>
    )
}