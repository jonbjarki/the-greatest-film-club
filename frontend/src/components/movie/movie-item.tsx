"use client"
import { Card, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { DialogContent, DialogHeader, DialogFooter, Dialog, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Image from "next/image"
import { Badge } from "../ui/badge";
import VoteForm from "./vote-form";
import { MovieItemType } from "@/lib/schemas";
import ProfileImageWithFallback from "../profile/profile-image-with-fallback";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export default function MovieItem({ movie }: { movie: MovieItemType }) {

    return (
        <li>
            <Dialog>
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
                            <CardAction>
                                <Badge className="" variant="ghost">{movie.vote_count} votes</Badge>
                            </CardAction>
                            <CardTitle>{movie.name}</CardTitle>
                            <CardDescription>{movie.release_year} · {movie.genres.join(", ")}</CardDescription>
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

                    <DialogFooter>
                        <div className="flex flex-col gap-2 w-full">
                            <div className="w-full flex justify-between items-center">
                                <p className="text-xs w-fit">Added by: {movie.added_by}</p>
                                <div className="flex items-center gap-2 w-fit">
                                    <Badge variant="ghost">{movie.vote_count} votes</Badge>
                                    <VoteForm movieId={movie.id} userVoted={movie.user_voted} />
                                </div>
                            </div>
                            {movie.voted_users.length > 0 && (
                                <ul className="flex flex-row gap-2 flex-wrap">
                                    {movie.voted_users.map(user => (
                                        <li key={user.id} className="w-10 h-10">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Link href={`/profile/${encodeURIComponent(user.username)}`}>
                                                        <ProfileImageWithFallback src={user.image_url ?? ""} alt={user.username} username={user.username} size="small" />
                                                    </Link>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{user.username}</p>
                                                </TooltipContent>


                                            </Tooltip>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </li >
    )
}