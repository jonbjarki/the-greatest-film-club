"use client"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DialogContent, DialogHeader, Dialog, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Image from "next/image"
import { MovieItemType } from "@/schemas/movie-schemas";
import { useState } from "react";

export default function MovieItem({ movie }: { movie: MovieItemType }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <li>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Card className="cursor-pointer gap-0 py-0 hover:bg-accent/50 transition-colors h-full">
                        <div className="relative aspect-video w-full">
                            {movie.backdrop_url || movie.poster_url ? (
                                <Image
                                    className="object-cover"
                                    fill
                                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                                    src={movie.backdrop_url ? movie.backdrop_url : movie.poster_url ?? ""}
                                    alt={"backdrop for " + movie.name}
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                                    <span className="text-muted-foreground">{movie.name}</span>
                                </div>
                            )}
                        </div>
                        <CardHeader className="p-4">
                            <CardTitle>{movie.name}</CardTitle>
                            <CardDescription>{movie.release_year} &middot; {movie.genres.join(", ")}</CardDescription>
                        </CardHeader>
                    </Card>
                </DialogTrigger>

                <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto">
                    <div className="relative -mx-6 -mt-6 aspect-video w-[calc(100%+3rem)]">
                        {(movie.backdrop_url || movie.poster_url) && (
                            <Image
                                className="object-cover"
                                fill
                                sizes="(min-width: 640px) 28rem, 100vw"
                                src={movie.backdrop_url ? movie.backdrop_url : movie.poster_url ?? ""}
                                alt={"backdrop for " + movie.name}
                            />
                        )}
                        {!movie.backdrop_url && !movie.poster_url && (
                            <div className="absolute inset-0 flex items-center justify-center bg-muted">
                                <span className="text-muted-foreground">{movie.name}</span>
                            </div>
                        )}
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
                </DialogContent>
            </Dialog>
        </li >
    )
}

