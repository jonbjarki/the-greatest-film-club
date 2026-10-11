import { getClubByNameAction } from "@/app/actions/club";
import MovieNightList from "@/components/club/movie-night-list";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function ClubMovieNightsPage(props: PageProps<"/club/view/[name]/movie-nights">) {
    const params = await props.params;
    const club = await getClubByNameAction(decodeURIComponent(params.name));
    if (!club) {
        notFound();
    }
    return (
        <main className="p-4 mx-auto max-w-3xl lg:max-w-6xl">
            <Link href={`/club/view/${encodeURIComponent(club.normalized_name)}`} className="text-sm underline">&larr; {club.name}</Link>
            <h1 className="text-3xl font-medium text-center mb-4">{club.name}</h1>
            <Suspense fallback={<div>Loading movie nights...</div>}>
                <MovieNightList club={club} />
            </Suspense>
        </main>
    );
}
