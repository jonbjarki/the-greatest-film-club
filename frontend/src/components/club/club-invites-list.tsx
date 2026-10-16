import { getActiveInvites } from "@/app/actions/club";
import { Badge } from "../ui/badge";
import { ItemGroup } from "../ui/item";
import ClubInviteItem from "./club-invite-item";

export default async function ClubInvitesList() {
    const invites = await getActiveInvites();
    if (invites.length === 0) {
        return null;
    }
    return (
        <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <h2 className="font-heading text-2xl">Pending invites</h2>
                <Badge>{invites.length}</Badge>
            </div>
            <ItemGroup>
                {invites.map((invite) => (
                    <ClubInviteItem key={invite.club_id} invite={invite} />
                ))}
            </ItemGroup>
        </section>
    );
}
