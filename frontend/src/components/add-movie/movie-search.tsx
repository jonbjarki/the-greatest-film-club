"use client"
import { useActionState, useDeferredValue, useEffect, useState, } from "react";
import { Input } from "../ui/input";
import { searchForMovie } from "@/app/actions/movie";
import { addMovieToMovieNightAction } from "@/app/actions/movie-night";
import { MovieSearchItemType } from "@/schemas/movie-schemas";
import MovieSearchItem from "./movie-search-item";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from 'use-debounce';

const initialState = {
    message: "",
    error: false,
};

export default function MovieSearchInput({ movieNightId, closeDialog }: { movieNightId: number, closeDialog: () => void }) {
    const [search, setSearch] = useState("");
    const [results, setResults] = useState<MovieSearchItemType[]>([])
    const deferred = useDeferredValue(search);
    const [state, formAction, pending] = useActionState(addMovieToMovieNightAction, initialState);
    const router = useRouter();

    const debouncedSearch = useDebouncedCallback(async (query: string) => {
        const res = await searchForMovie(query);
        setResults(res.results);
    }, 300);

    useEffect(() => {
        debouncedSearch(deferred);
    }, [deferred, debouncedSearch]);

    useEffect(() => {
        if (state.message) {
            if (state.error) {
                toast.error(state.message);
            } else {
                toast.success(state.message);
                closeDialog();
                router.refresh();
            }
        }
    }, [state, closeDialog, router]);


    return (
        <div>
            <Input type="search" className="bg-white rounded-sm p-4" placeholder="Search for a movie.." value={search} onChange={(e) => setSearch(e.target.value)} />
            <form action={formAction}>
                <input type="hidden" name="movieNightId" value={movieNightId} />
                <ul>
                    {results.map(
                        movie => <MovieSearchItem key={movie.id} movie={movie} pending={pending} />
                    )}
                </ul>
            </form>
        </div >

    )
}
