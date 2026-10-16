"use client"
import { CreateMovieNightActionState, createMovieNightAction } from "@/app/actions/movie-night";
import { useActionState, useEffect, useState } from "react";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH, TITLE_MIN_LENGTH } from "@/schemas/movie-night-schemas";

type FormField = "title" | "description" | "deadline";

const initialState: CreateMovieNightActionState = {
    success: false,
};

/** Converts a datetime-local value (user's local time, no offset) to an ISO string in UTC. */
function toIsoDeadline(localValue: string) {
    return localValue ? new Date(localValue).toISOString() : "";
}

export default function CreateMovieNightForm({ clubId, clubNormalizedName }: { clubId: number, clubNormalizedName: string }) {
    const [state, formAction, pending] = useActionState(createMovieNightAction.bind(null, clubId, clubNormalizedName), initialState);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");
    // Fields edited since the last submit; their stale server errors are hidden. Resets whenever a new state arrives.
    const [edited, setEdited] = useState<{ state: CreateMovieNightActionState, fields: FormField[] }>({ state, fields: [] });
    const editedFields = edited.state === state ? edited.fields : [];
    const errors = (field: FormField) => editedFields.includes(field) ? undefined : state.errors?.[field];

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

    const handleChange = (field: FormField, value: string) => {
        if (field === "title") {
            setTitle(value);
        } else if (field === "description") {
            setDescription(value);
        } else {
            setDeadline(value);
        }
        if (!editedFields.includes(field)) {
            setEdited({ state, fields: [...editedFields, field] });
        }
    };

    return (
        <form action={formAction}>
            <FieldGroup>
                <Field data-invalid={!!errors("title")}>
                    <FieldLabel htmlFor="title">Title</FieldLabel>
                    <FieldContent>
                        <Input id="title" autoComplete="off" aria-invalid={!!errors("title")} minLength={TITLE_MIN_LENGTH} maxLength={TITLE_MAX_LENGTH} type="text" placeholder="Title your movie night..." name="title" value={title} onChange={(e) => handleChange("title", e.target.value)} required />
                        <span className="text-xs text-muted-foreground">{title.length}/{TITLE_MAX_LENGTH}</span>
                        {errors("title")?.map((error, index) => (
                            <FieldError key={index}>{error}</FieldError>
                        ))}
                    </FieldContent>
                </Field>
                <Field data-invalid={!!errors("description")}>
                    <FieldLabel htmlFor="description">Description</FieldLabel>
                    <FieldContent>
                        <Textarea
                            id="description"
                            aria-invalid={!!errors("description")}
                            maxLength={DESCRIPTION_MAX_LENGTH}
                            placeholder="What's the theme of the night? (optional)"
                            name="description"
                            value={description}
                            onChange={(e) => handleChange("description", e.target.value)} />
                        <span className="text-xs text-muted-foreground">{description.length}/{DESCRIPTION_MAX_LENGTH}</span>
                        {errors("description")?.map((error, index) => (
                            <FieldError key={index}>{error}</FieldError>
                        ))}
                    </FieldContent>
                </Field>
                <Field data-invalid={!!errors("deadline")}>
                    <FieldLabel htmlFor="deadline">Voting deadline</FieldLabel>
                    <FieldContent>
                        <Input
                            id="deadline"
                            type="datetime-local"
                            aria-invalid={!!errors("deadline")}
                            value={deadline}
                            onChange={(e) => handleChange("deadline", e.target.value)} />
                        {/* The server can't know the user's timezone, so send the deadline as UTC */}
                        <input type="hidden" name="deadline" value={toIsoDeadline(deadline)} />
                        <FieldDescription>Optional. Voting closes at this time.</FieldDescription>
                        {errors("deadline")?.map((error, index) => (
                            <FieldError key={index}>{error}</FieldError>
                        ))}
                    </FieldContent>
                </Field>
                <Field orientation="horizontal" className="justify-end">
                    <Button type="submit" disabled={pending}>{pending ? "Creating..." : "Create"}</Button>
                </Field>
            </FieldGroup>
        </form>
    )
}
