import { getClubsForUserAction } from "@/app/actions/club";
import { Plus, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";
import ClubListItem from "./club-list-item";

export default async function ClubsList() {
    const clubs = await getClubsForUserAction();
    return (
        <section className="flex flex-col gap-4">
            <h2 className="font-heading text-2xl">Clubs</h2>
            {clubs.length === 0 ? (
                <Empty className="border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Users />
                        </EmptyMedia>
                        <EmptyTitle>No clubs yet</EmptyTitle>
                        <EmptyDescription>
                            You haven&apos;t joined any clubs. Create one and invite your friends, or accept an invite.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button asChild>
                            <Link href="/clubs/create">
                                <Plus data-icon="inline-start" />
                                Create your first club
                            </Link>
                        </Button>
                    </EmptyContent>
                </Empty>
            ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {clubs.map(club => (
                        <li key={club.id}>
                            <ClubListItem club={club} />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
