import { getClubMembersAction } from "@/app/actions/club";
import { ClubMember, ClubMetadata } from "@/schemas/club-schemas";
import ManageMemberItem from "./manage-member-item";

// Owner first, then active members, then pending invites; alphabetical within each group
function memberOrder(member: ClubMember) {
    if (member.role === "owner") return 0;
    return member.status === "active" ? 1 : 2;
}

export default async function ManageMembersList({ club }: { club: ClubMetadata }) {
    const members = await getClubMembersAction(club.id);
    const sorted = [...members].sort((a, b) =>
        memberOrder(a) - memberOrder(b) || a.user.username.localeCompare(b.user.username)
    );

    return (
        <div className="flex flex-col gap-2">
            {sorted.map((member) => (
                <ManageMemberItem key={member.user.id} member={member} clubName={club.name} />
            ))}
            {sorted.length <= 1 && (
                <p className="text-sm text-muted-foreground">No other members yet. Invite someone above.</p>
            )}
        </div>
    );
}
