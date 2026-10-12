import { auth } from "@/../auth";
import ClubsList from "@/components/club/clubs-list";
import { redirectToLogin } from "@/lib/common";

export default async function ClubsPage() {
    const session = await auth();
    if (!session) {
        return redirectToLogin();
    }

    return (
        <div>
            <h1 className="text-3xl font-medium text-center">Movie Clubs</h1>
            <main className="flex flex-col gap-4 p-4 mx-auto max-w-3xl lg:max-w-6xl">
                <h2>Your clubs</h2>
                <ClubsList user={session.user} />
            </main>
        </div>
    );
}