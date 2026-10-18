import { getClubByNameAction } from "@/app/actions/club";
import ClubMembers from "@/components/club/club-members";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";

export default async function ClubPage(props: PageProps<"/clubs/view/[name]">) {
    const params = await props.params;
    const club = await getClubByNameAction(params.name);
    if (!club) {
        notFound();
    }
    return (
        <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="font-heading text-xl">About</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{club.description || "This club has no description."}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-heading text-xl">Membership</CardTitle>
                </CardHeader>
                <CardContent>
                    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                        <dt className="text-muted-foreground">Your role</dt>
                        <dd className="capitalize">{club.member?.role ?? "—"}</dd>
                        <dt className="text-muted-foreground">Joined</dt>
                        <dd>{club.member?.joined_at ? club.member.joined_at.toLocaleDateString() : "—"}</dd>
                    </dl>
                </CardContent>
            </Card>
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle className="font-heading text-xl">Members</CardTitle>
                </CardHeader>
                <CardContent>
                    <ClubMembers clubId={club.id} />
                </CardContent>
            </Card>
        </div>
    );
}
