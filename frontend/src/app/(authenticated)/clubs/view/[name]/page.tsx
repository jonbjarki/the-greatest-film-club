import { getClubByNameAction } from "@/app/actions/club";
import ClubInfo from "@/components/club/club-info";
import MovieNightList from "@/components/club/movie-night-list";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function ClubPage(props: PageProps<"/club/view/[name]">) {
    const params = await props.params;
    const club = await getClubByNameAction(decodeURIComponent(params.name));
    if (!club) {
        notFound();
    }
    return (
        <main className="p-4 mx-auto max-w-3xl lg:max-w-6xl">
            <ClubInfo club={club} />
            <Suspense fallback={<div>Loading movie nights...</div>}>
                <MovieNightList club={club} />
            </Suspense>
        </main>
    );
}
