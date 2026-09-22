"use client"

import { useCallback, useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import MovieSearchInput from "./movie-search";

export default function AddMovieButton() {
    const [open, setOpen] = useState(false);
    const handleOpenChange = (open: boolean) => setOpen(open);
    const closeDialog = useCallback(() => setOpen(false), []);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange} >
            <DialogTrigger asChild>
                <Button variant={"default"} className="w-fit">Add Movie</Button>
            </DialogTrigger>

            <DialogContent showCloseButton={false} className="top-[10%] translate-y-0 sm:max-w-md bg-none! shadow-none! ring-0 drop-shadow-none!  outline-none! border-none! bg-transparent max-h-[calc(100vh-2rem)] overflow-y-auto">

                <MovieSearchInput closeDialog={closeDialog} />
            </DialogContent>
        </Dialog>
    )
}