"use client"
import { inviteUserAction, InviteUserActionState } from "@/app/actions/club";
import { USERNAME_MAX_LENGTH } from "@/schemas/club-schemas";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Field, FieldContent, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";

const initialState: InviteUserActionState = {
    success: false,
};

export default function InviteUserForm({ clubId }: { clubId: number }) {
    const [state, formAction, pending] = useActionState(inviteUserAction.bind(null, clubId), initialState);
    const [username, setUsername] = useState("");
    // The action state the input was last synced with: clear the input after a successful invite,
    // and hide stale errors once the user edits it. Adjusted during render instead of in an effect.
    const [seenState, setSeenState] = useState(state);
    const [editedSinceSubmit, setEditedSinceSubmit] = useState(false);
    if (seenState !== state) {
        setSeenState(state);
        setEditedSinceSubmit(false);
        if (state.success) {
            setUsername("");
        }
    }
    const errors = editedSinceSubmit ? undefined : state.errors?.username;

    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast.success(state.message)
            }
            else {
                toast.error(state.message)
            }
        }
    }, [state])

    return (
        <form action={formAction}>
            <Field data-invalid={!!errors}>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <FieldContent>
                    <div className="flex gap-2">
                        <Input
                            className="max-w-60"
                            id="username"
                            name="username"
                            autoComplete="off"
                            placeholder="Enter a username..."
                            maxLength={USERNAME_MAX_LENGTH}
                            aria-invalid={!!errors}
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setEditedSinceSubmit(true);
                            }}
                            required />
                        <Button type="submit" disabled={pending}>
                            {pending && <Spinner data-icon="inline-start" className="size-4" />}
                            Invite
                        </Button>
                    </div>
                    {errors?.map((error, index) => (
                        <FieldError key={index}>{error}</FieldError>
                    ))}
                </FieldContent>
            </Field>
        </form>
    )
}
