import { getClubByNameAction } from "@/app/actions/club";
import { getMovieNightByTitleAction, getMovieNightMoviesAction } from "@/app/actions/movie-night";
import { canManageClub } from "@/lib/club-permissions";
import AddMovieButton from "@/components/add-movie/add-movie-button";
import MovieList from "@/components/movie/movie-list";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/../auth";

async function MovieNightMovies({ movieNightId, user_id }: { movieNightId: number, user_id: string }) {
    const movies = await getMovieNightMoviesAction(movieNightId);
    return <MovieList movies={movies} movieNightId={movieNightId} user_id={user_id} />;
}

export default async function MovieNightPage(props: PageProps<"/clubs/view/[name]/movie-nights/[title]">) {
    const session = await auth()
    if (!session) {
        notFound();
    }
    const params = await props.params;
    const club = await getClubByNameAction(params.name);
    if (!club) {
        notFound();
    }
    const movieNight = await getMovieNightByTitleAction(club.id, params.title);
    if (!movieNight) {
        notFound();
    }
    const canAddMovies = canManageClub(club);

    return (
        <div className="flex flex-col gap-4">
            <Link href={`/clubs/view/${encodeURIComponent(club.normalized_name)}/movie-nights`} className="text-sm underline">&larr; Movie Nights</Link>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-medium">{movieNight.title}</h1>
                    {movieNight.description && <p className="text-muted-foreground max-w-prose mb-2">{movieNight.description}</p>}
                    {movieNight.deadline && (
                        <p className="text-sm">Vote Deadline: {new Date(movieNight.deadline).toLocaleDateString()}</p>
                    )}
                </div>
                {canAddMovies && <AddMovieButton movieNightId={movieNight.id} />}
            </div>
            <Suspense fallback={<div>Loading movies...</div>}>
                <MovieNightMovies movieNightId={movieNight.id} user_id={session.user.id} />
            </Suspense>
        </div>
    );
}
