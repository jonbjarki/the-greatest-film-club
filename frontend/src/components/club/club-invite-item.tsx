import { ClubInvite } from "@/schemas/club-schemas";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { joinClubAction } from "@/app/actions/club";

export function ClubInviteItem({ invite }: { invite: ClubInvite }) {
    const joinClub = joinClubAction.bind(null, invite.club_id);
    return (
        <li className="w-full border rounded-lg p-4 flex flex-row justify-between items-center">
            <p>{invite.name}</p>
            <p className="text-accent-foreground text-sm">Invited at: {invite.invited_at.toLocaleDateString()}</p>
            <Button onClick={joinClub}>Accept</Button>
        </li>
    );
}