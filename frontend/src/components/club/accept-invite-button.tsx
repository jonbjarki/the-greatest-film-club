"use client"

import { joinClubAction } from "@/app/actions/club";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

export default function AcceptInviteButton({ clubId }: { clubId: number }) {
    const [isPending, startTransition] = useTransition();

    const acceptInvite = () => {
        // No try/catch: on success the action redirects, which reaches the client as a thrown
        // redirect error that Next.js must handle itself
        startTransition(async () => {
            const result = await joinClubAction(clubId);
            if (result?.error) {
                toast.error(result.error);
            }
        });
    };

    return (
        <Button size="sm" onClick={acceptInvite} disabled={isPending}>
            {isPending && <Spinner data-icon="inline-start" className="size-4" />}
            Accept
        </Button>
    );
}
