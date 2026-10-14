import { getActiveInvites } from "@/app/actions/club";
import { ClubInviteItem } from "./club-invite-item";

export default async function ClubInvitesList() {
    const invites = await getActiveInvites();
    return (
        <div>
            <h2 className="text-lg">Your club invites</h2>
            {invites.length === 0 ? (
                <p>You have no pending club invites.</p>
            ) : (
                <ul className="grid grid-cols-1 gap-4 w-sm">
                    {invites.map((invite) => (
                        <ClubInviteItem key={invite.club_id} invite={invite} />
                    ))}
                </ul>
            )}
        </div>
    );
}