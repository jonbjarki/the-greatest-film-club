import { ClubInvite } from "@/schemas/club-schemas";
import { Mail } from "lucide-react";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "../ui/item";
import AcceptInviteButton from "./accept-invite-button";

export default function ClubInviteItem({ invite }: { invite: ClubInvite }) {
    return (
        <Item variant="outline" role="listitem">
            <ItemMedia variant="icon">
                <Mail />
            </ItemMedia>
            <ItemContent>
                <ItemTitle>{invite.name}</ItemTitle>
                <ItemDescription>
                    Invited {invite.invited_at.toLocaleDateString("default", { day: "numeric", month: "short", year: "numeric" })}
                </ItemDescription>
            </ItemContent>
            <ItemActions>
                <AcceptInviteButton clubId={invite.club_id} />
            </ItemActions>
        </Item>
    );
}
