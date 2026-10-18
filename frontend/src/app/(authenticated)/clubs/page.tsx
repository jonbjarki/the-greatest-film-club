import { auth } from "@/../auth";
import ClubInvitesList from "@/components/club/club-invites-list";
import ClubsList from "@/components/club/clubs-list";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { redirectToLogin } from "@/lib/common";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default async function ClubsPage() {
    const session = await auth();
    if (!session) {
        return redirectToLogin();
    }

    return (
        <main className="flex flex-col gap-8 w-full">
            <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-heading text-3xl font-medium">Your Clubs</h1>
                    <p className="text-muted-foreground">Movie clubs you're a member of</p>
                </div>
                <Button asChild className="self-start sm:self-auto">
                    <Link href="/clubs/create">
                        <Plus data-icon="inline-start" />
                        Create club
                    </Link>
                </Button>
            </section>
            <Suspense fallback={<Skeleton className="h-16 rounded-2xl" />}>
                <ClubInvitesList />
            </Suspense>
            <Suspense fallback={
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
                </div>
            }>
                <ClubsList />
            </Suspense>
        </main>
    );
}
