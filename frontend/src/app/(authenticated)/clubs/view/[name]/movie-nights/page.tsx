import { getClubByNameAction } from "@/app/actions/club";
import MovieNightList from "@/components/club/movie-night-list";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function ClubMovieNightsPage(props: PageProps<"/clubs/view/[name]/movie-nights">) {
    const params = await props.params;
    const club = await getClubByNameAction(decodeURIComponent(params.name));
    if (!club) {
        notFound();
    }
    return (
        <Suspense fallback={<div>Loading movie nights...</div>}>
            <MovieNightList club={club} />
        </Suspense>
    );
}
