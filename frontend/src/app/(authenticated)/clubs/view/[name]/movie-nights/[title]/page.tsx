import { getClubByNameAction } from "@/app/actions/club";
import { getMovieNightByTitleAction, getMovieNightMoviesAction } from "@/app/actions/movie-night";
import AddMovieButton from "@/components/add-movie/add-movie-button";
import MovieList from "@/components/movie/movie-list";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

async function MovieNightMovies({ movieNightId }: { movieNightId: number }) {
    const movies = await getMovieNightMoviesAction(movieNightId);
    return <MovieList movies={movies} />;
}

export default async function MovieNightPage(props: PageProps<"/club/view/[name]/movie-nights/[title]">) {
    const params = await props.params;
    const club = await getClubByNameAction(decodeURIComponent(params.name));
    if (!club) {
        notFound();
    }
    const movieNight = await getMovieNightByTitleAction(club.id, decodeURIComponent(params.title));
    if (!movieNight) {
        notFound();
    }
    const canAddMovies = club.member?.status === "active" && (club.member.role === "admin" || club.member.role === "owner");

    return (
        <main className="flex flex-col gap-4 p-4 mx-auto max-w-3xl lg:max-w-6xl">
            <Link href={`/club/view/${encodeURIComponent(club.normalized_name)}`} className="text-sm underline">&larr; {club.name}</Link>
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
                <MovieNightMovies movieNightId={movieNight.id} />
            </Suspense>
        </main>
    );
}
