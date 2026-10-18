"use client"

import { leaveClubAction } from "@/app/actions/club";
import { LogOut } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

export default function LeaveClubButton({ clubId, clubName, isOwner }: { clubId: number, clubName: string, isOwner: boolean }) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const leaveClub = (e: React.MouseEvent) => {
        // Keep the dialog open while leaving; on success the action redirects away
        e.preventDefault();
        startTransition(async () => {
            const result = await leaveClubAction(clubId);
            if (result?.error) {
                toast.error(result.error);
                setOpen(false);
            }
        });
    };

    if (isOwner) {
        return (
            <div className="flex flex-col items-start gap-2">
                <Button variant="destructive" disabled><LogOut /> Leave club</Button>
                <p className="text-sm text-muted-foreground">Owners can&apos;t leave their club.</p>
            </div>
        );
    }

    return (
        <AlertDialog open={open} onOpenChange={(open) => !isPending && setOpen(open)}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive"><LogOut /> Leave club</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Leave {clubName}?</AlertDialogTitle>
                    <AlertDialogDescription>You&apos;ll lose access to the club&apos;s movie nights. You need a new invite to rejoin.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={leaveClub} disabled={isPending}>
                        {isPending && <Spinner data-icon="inline-start" className="size-4" />}
                        Leave
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
