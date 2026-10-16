"use client"

import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import CreateMovieNightForm from "./create-movie-night-form";

export default function CreateMovieNightButton({ clubId, clubNormalizedName }: { clubId: number, clubNormalizedName: string }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm"><Plus /> Create Movie Night</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-heading text-xl">Create a movie night</DialogTitle>
                    <DialogDescription>Members can add movies and vote once it&apos;s created.</DialogDescription>
                </DialogHeader>
                <CreateMovieNightForm clubId={clubId} clubNormalizedName={clubNormalizedName} />
            </DialogContent>
        </Dialog>
    )
}
