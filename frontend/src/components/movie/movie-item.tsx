"use client"
import { Card, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { DialogContent, DialogHeader, DialogFooter, Dialog, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Image from "next/image"
import { Badge } from "../ui/badge";
import VoteForm from "./vote-form";
import { useState } from "react";
import { MovieItemType } from "@/lib/schemas";

export default function MovieItem({ movie }: { movie: MovieItemType }) {
    return (
        <li>
            <Dialog>
                <DialogTrigger asChild>
                    <Card className="cursor-pointer gap-0 py-0 hover:bg-accent/50 transition-colors h-full">
                        <div className="relative aspect-video w-full">
                            <Image
                                className="object-cover"
                                fill
                                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                                src={movie.backdrop_url}
                                alt={"backdrop for " + movie.name}
                            />
                        </div>
                        <CardHeader className="p-4">
                            <CardAction>
                                <Badge className="" variant="default">{movie.vote_count} votes</Badge>
                            </CardAction>
                            <CardTitle>{movie.name}</CardTitle>
                            <CardDescription>{movie.release_year} · {movie.genres.join(", ")}</CardDescription>
                        </CardHeader>
                    </Card>
                </DialogTrigger>

                <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto">
                    <div className="relative -mx-6 -mt-6 aspect-video w-[calc(100%+3rem)]">
                        <Image
                            className="object-cover"
                            fill
                            sizes="(min-width: 640px) 28rem, 100vw"
                            src={movie.backdrop_url}
                            alt={"backdrop for " + movie.name}
                        />
                    </div>

                    <DialogHeader>
                        <DialogTitle>{movie.name}</DialogTitle>
                        <DialogDescription>
                            {movie.release_year} &middot; {movie.genres.join(", ")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-3 py-2 text-sm">
                        <p>{movie.description}</p>
                        <p className="text-muted-foreground">
                            <span className="font-medium text-foreground">Director:</span> {movie.director_names.join(", ")}
                        </p>
                        <p className="text-muted-foreground">
                            <span className="font-medium text-foreground">Starring:</span> {movie.actor_names.join(", ")}
                        </p>
                    </div>

                    <DialogFooter>
                        <div className="w-full flex justify-between items-center">
                            <p className="text-xs w-fit">Added by: {movie.added_by}</p>
                            <div className="flex items-center gap-2 w-fit">
                                <Badge>{movie.vote_count} votes</Badge>
                                <VoteForm movieId={movie.id} userVoted={movie.user_voted} />
                            </div>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </li >
    )
}