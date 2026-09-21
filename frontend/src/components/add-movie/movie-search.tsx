"use client"
import { useActionState, useDeferredValue, useEffect, useState, } from "react";
import { Input } from "../ui/input";
import { addMovie, searchForMovie } from "@/app/actions/movie";
import { MovieSearchItemType } from "@/lib/schemas";
import { Button } from "../ui/button";
import MovieSearchItem from "./movie-search-item";
import { toast } from "sonner";

const initialState = {
    message: "",
    error: false,
};

export default function MovieSearchInput({ closeDialog }: { closeDialog: () => void }) {
    const [search, setSearch] = useState("");
    const [results, setResults] = useState<MovieSearchItemType[]>([])
    const deferred = useDeferredValue(search);
    const [state, formAction, pending] = useActionState(addMovie, initialState);

    useEffect(() => {
        const searchFunction = async () => {
            const res = await searchForMovie(deferred);
            setResults(res.results);
            console.log(res);
        }
        searchFunction();
    }, [deferred])

    useEffect(() => {
        if (state.message) {
            if (state.error) {
                toast.error(state.message);
            } else {
                toast.success(state.message);
                closeDialog();
            }
        }
    }, [state]);


    return (
        <div>
            <Input type="search" className="bg-white rounded-sm p-4" placeholder="Search for a movie.." value={search} onChange={(e) => setSearch(e.target.value)} />
            <form action={formAction}>
                <ul>
                    {results.map(
                        movie => <MovieSearchItem key={movie.id} movie={movie} pending={pending} />
                    )}
                </ul>
            </form>
        </div >

    )
}