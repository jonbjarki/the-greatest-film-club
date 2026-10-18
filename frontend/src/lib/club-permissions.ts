import { ClubMetadata } from "@/schemas/club-schemas";

/** Whether the current user has joined the club (not just been invited). */
export function isActiveMember(club: ClubMetadata) {
    return club.member?.status === "active";
}

/** Whether the current user is the club's active owner. */
export function isClubOwner(club: ClubMetadata) {
    return club.member?.status === "active" && club.member.role === "owner";
}

/** Whether the current user is an active admin or owner of the club. */
export function canManageClub(club: ClubMetadata) {
    return club.member?.status === "active" && (club.member.role === "admin" || club.member.role === "owner");
}
