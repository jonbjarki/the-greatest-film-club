import { getMovieNightsAction } from "@/app/actions/movie-night";
import { ClubMetadata } from "@/schemas/club-schemas";
import MovieNightListItem from "./movie-night-list-item";
import { Button } from "../ui/button";

export default async function MovieNightList({ club }: { club: ClubMetadata }) {
    const movieNights = await getMovieNightsAction(club.id);
    const canCreate = club.member?.role === "admin" || club.member?.role === "owner";
    return (
        <>
            <div className="flex flex-row gap-4 items-center mb-4">
                <h2 className="text-2xl font-serif">Movie Nights</h2>
                {canCreate && (
                    <Button size="sm">
                        Create Movie Night
                    </Button>
                )}
            </div>
            {movieNights.length === 0 ? (
                <p className="text-muted-foreground">This club has no movie nights yet.</p>
            ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {movieNights.map((movieNight) => (
                        <li key={movieNight.id}>
                            <MovieNightListItem movieNight={movieNight} normalized_club_name={club.normalized_name} />
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}
