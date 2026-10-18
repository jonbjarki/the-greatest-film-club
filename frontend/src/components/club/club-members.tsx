import { getClubMembersAction } from "@/app/actions/club";
import { ClubMember } from "@/schemas/club-schemas";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ProfileImageWithFallback from "../profile/profile-image-with-fallback";

// Owner first, then admins, then active members alphabetical within each group
function memberOrder(member: ClubMember) {
    if (member.role === "owner") return 0;
    return member.role === "admin" ? 1 : 2;
}

export default async function ClubMembers({ clubId }: { clubId: number }) {
    const members = (await getClubMembersAction(clubId)).filter(i => i.status !== "invited");
    const sorted = [...members].sort((a, b) =>
        memberOrder(a) - memberOrder(b) || a.user.username.localeCompare(b.user.username)
    );

    if (sorted.length === 0) {
        return <p className="text-sm text-muted-foreground">This club has no members yet.</p>;
    }

    return (
        <ul className="flex flex-row gap-4">
            {sorted.map(({ user, role, status }) => {
                const isInvited = status === "invited";
                return (
                    <li key={user.id}>
                        <Link
                            href={`/profile/${encodeURIComponent(user.username)}`}
                            className="flex items-center gap-3 rounded-md p-1.5 hover:bg-accent"
                        >
                            <div className="size-9 shrink-0">
                                <ProfileImageWithFallback size="small" src={user.image_url ?? ""} alt={`Profile image for ${user.username}`} username={user.username} />
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium">{user.username}</p>
                                <p className="text-xs text-muted-foreground capitalize">{isInvited ? "Invited" : role}</p>
                            </div>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}
