import { MovieNight } from "@/schemas/movie-night-schemas";
import { Card, CardFooter, CardHeader } from "../ui/card";
import Link from "next/link";

export default function MovieNightListItem({ movieNight, normalized_club_name }: { movieNight: MovieNight, normalized_club_name: string }) {
    return (
        <Link href={`/club/view/${encodeURIComponent(normalized_club_name)}/movie-nights/${encodeURIComponent(movieNight.normalized_title)}`}>
            <Card className="hover:shadow-xs transition-shadow h-full hover:border">
                <CardHeader>
                    {movieNight.title}
                    {movieNight.deadline && (
                        <p className="text-sm text-muted-foreground">
                            {new Date(movieNight.deadline).toLocaleDateString()}
                        </p>
                    )}
                </CardHeader>

                {movieNight.description && (
                    <CardFooter>
                        <p className="text-sm text-muted-foreground">
                            {movieNight.description.length > 50 ? movieNight.description.slice(0, 50).trim() + "..." : movieNight.description}
                        </p>
                    </CardFooter>
                )}
            </Card>
        </Link>
    );
}

