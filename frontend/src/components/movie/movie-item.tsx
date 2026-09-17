"use client"
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Dialog, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MovieType } from "@/types/movie-types";
import Image from "next/image"
import { Badge } from "../ui/badge";

export default function MovieItem({ movie }: { movie: MovieType }) {
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

                    <DialogFooter className="w-full">
                        <Badge>{movie.vote_count} votes</Badge>
                        <form>
                            <Button type="submit">Vote for this movie</Button>
                        </form>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </li >
    )
}