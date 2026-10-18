"use client"

import { kickMemberAction, updateMemberRoleAction } from "@/app/actions/club";
import { ClubMember } from "@/schemas/club-schemas";
import { UserMinus } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import ProfileImageWithFallback from "../profile/profile-image-with-fallback";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "../ui/item";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Spinner } from "../ui/spinner";

type AssignableRole = "member" | "admin";

export default function ManageMemberItem({ member, clubName }: { member: ClubMember, clubName: string }) {
    const { user } = member;
    const isOwner = member.role === "owner";
    const isInvited = member.status === "invited";

    const [role, setRole] = useState(member.role);
    const [isChangingRole, startRoleTransition] = useTransition();
    const [kickDialogOpen, setKickDialogOpen] = useState(false);
    const [isKicking, startKickTransition] = useTransition();

    const changeRole = (newRole: AssignableRole) => {
        const previousRole = role;
        setRole(newRole);
        startRoleTransition(async () => {
            const result = await updateMemberRoleAction(member.club_id, user.id, newRole);
            if (result.error) {
                setRole(previousRole);
                toast.error(result.error);
            } else {
                toast.success(`${user.username} is now ${newRole === "admin" ? "an admin" : "a member"}`);
            }
        });
    };

    const kick = (e: React.MouseEvent) => {
        // Keep the dialog open while the request runs
        e.preventDefault();
        startKickTransition(async () => {
            const result = await kickMemberAction(member.club_id, user.id);
            setKickDialogOpen(false);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(isInvited ? `Invite for ${user.username} cancelled` : `${user.username} was removed from the club`);
            }
        });
    };

    return (
        <Item variant="outline" size="sm">
            <ItemMedia>
                <div className="size-10">
                    <ProfileImageWithFallback size="small" src={user.image_url ?? ""} alt={`Profile image for ${user.username}`} username={user.username} />
                </div>
            </ItemMedia>
            <ItemContent>
                <ItemTitle>
                    <Link href={`/profile/${encodeURIComponent(user.username)}`} className="hover:underline">{user.username}</Link>
                    {isOwner && <Badge variant="secondary">Owner</Badge>}
                    {isInvited && <Badge variant="outline">Invited</Badge>}
                </ItemTitle>
                <ItemDescription>
                    {isInvited
                        ? `Invited ${member.invited_at?.toLocaleDateString() ?? ""}`
                        : `Joined ${member.joined_at?.toLocaleDateString() ?? ""}`}
                </ItemDescription>
            </ItemContent>
            {!isOwner && (
                <ItemActions className="gap-4">
                    {!isInvited && (
                        <Select value={role} onValueChange={(value) => changeRole(value as AssignableRole)} disabled={isChangingRole}>
                            <SelectTrigger size="sm" className="w-28" aria-label={`Role for ${user.username}`}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                    <AlertDialog open={kickDialogOpen} onOpenChange={(open) => !isKicking && setKickDialogOpen(open)}>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive gap-1" aria-label={isInvited ? `Cancel invite for ${user.username}` : `Remove ${user.username}`}>
                                <UserMinus /> {isInvited ? "Cancel" : "Kick"}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>{isInvited ? `Cancel invite for ${user.username}?` : `Remove ${user.username} from ${clubName}?`}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {isInvited
                                        ? "They won't be able to join unless you invite them again."
                                        : "They'll lose access to the club and need a new invite to rejoin."}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isKicking}>Cancel</AlertDialogCancel>
                                <AlertDialogAction variant="destructive" onClick={kick} disabled={isKicking}>
                                    {isKicking && <Spinner data-icon="inline-start" className="size-4" />}
                                    {isInvited ? "Cancel invite" : "Remove"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </ItemActions>
            )}
        </Item>
    );
}
