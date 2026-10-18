import { ClubMetadata } from "@/schemas/club-schemas";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "../ui/card";

export default function ClubListItem({ club }: { club: ClubMetadata }) {
    return (
        <Link href={`/clubs/view/${encodeURIComponent(club.normalized_name)}`}>
            <Card className="hover:shadow-xs transition-shadow h-full hover:border">
                <CardHeader>
                    <CardTitle>{club.name}</CardTitle>
                    {club.member && (
                        <CardAction>
                            <Badge variant="secondary" className="capitalize">{club.member.role}</Badge>
                        </CardAction>
                    )}
                    <CardDescription className="line-clamp-2">
                        {club.description || "No description."}
                    </CardDescription>
                </CardHeader>
            </Card>
        </Link>
    );
}
