import { getClubByNameAction } from "@/app/actions/club";
import InviteUserForm from "@/components/club/invite-user-form";
import LeaveClubButton from "@/components/club/leave-club-button";
import ManageMembersList from "@/components/club/manage-members-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { canManageClub, isActiveMember, isClubOwner } from "@/lib/club-permissions";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

export default async function ClubSettingsPage(props: PageProps<"/clubs/view/[name]/settings">) {
    const params = await props.params;
    const club = await getClubByNameAction(params.name);
    if (!club) {
        notFound();
    }
    if (!isActiveMember(club)) {
        redirect(`/clubs/view/${encodeURIComponent(club.normalized_name)}`);
    }
    return (
        <div className="flex flex-col gap-4">
            {canManageClub(club) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-heading text-xl">Invite members</CardTitle>
                        <CardDescription>Invite a user to join this club by their username.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <InviteUserForm clubId={club.id} />
                    </CardContent>
                </Card>
            )}
            {isClubOwner(club) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-heading text-xl">Manage members</CardTitle>
                        <CardDescription>Change member roles or remove people from the club.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Suspense fallback={
                            <div className="flex flex-col gap-2">
                                {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
                            </div>
                        }>
                            <ManageMembersList club={club} />
                        </Suspense>
                    </CardContent>
                </Card>
            )}
            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="font-heading text-xl">Leave club</CardTitle>
                    <CardDescription>Stop being a member of {club.name}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <LeaveClubButton clubId={club.id} clubName={club.name} isOwner={club.member?.role === "owner"} />
                </CardContent>
            </Card>
        </div>
    );
}
