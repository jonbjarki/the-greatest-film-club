"use client"
import { useDeferredValue, useEffect, useState } from "react";
import { Input } from "../ui/input";
import { addMovie, searchForMovie } from "@/app/actions/movie";
import { MovieSearchItemType } from "@/lib/schemas";
import { Button } from "../ui/button";

export default function MovieSearchInput({ closeDialog }: { closeDialog: () => void }) {
    const [search, setSearch] = useState("");
    const [results, setResults] = useState<MovieSearchItemType[]>([])
    const deferred = useDeferredValue(search);

    useEffect(() => {
        console.log("Ran with: ", deferred);
        const searchFunction = async () => {
            const res = await searchForMovie(deferred);
            setResults(res.results);
            console.log(res);
        }
        searchFunction();
    }, [deferred])


    return (
        <div>
            <Input type="search" className="bg-white rounded-sm p-4" placeholder="Search for a movie.." value={search} onChange={(e) => setSearch(e.target.value)} />
            <ul>
                {results.map(
                    movie =>
                        <Button key={movie.id} onClick={() => {
                            addMovie.bind(null, movie.id)();
                            closeDialog();
                        }} variant="outline" className="bg-background p-2 m-1 w-full justify-start">{movie.title} ({movie.release_year}) </Button>
                )}
            </ul>
        </div>

    )
}