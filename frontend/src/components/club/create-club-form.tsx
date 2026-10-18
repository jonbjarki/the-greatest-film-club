"use client"
import { createClubAction, CreateClubActionState } from "@/app/actions/club";
import { useActionState, useEffect, useState } from "react";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { DESCRIPTION_MAX_LENGTH, NAME_MAX_LENGTH, NAME_MIN_LENGTH } from "@/schemas/club-schemas";

const initialState: CreateClubActionState = {
    success: false,
};

export default function CreateClubForm() {
    const [state, formAction, pending] = useActionState(createClubAction, initialState);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    // The action state whose errors the user dismissed by editing; a new submit returns a new state, so its errors show again
    const [dismissedState, setDismissedState] = useState<CreateClubActionState | null>(null);
    const errors = dismissedState === state ? undefined : state.errors;
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

    const handleChange = (field: "name" | "description", value: string) => {
        if (field === "name") {
            setName(value);
        } else if (field === "description") {
            setDescription(value);
        }
        setDismissedState(state);
    };

    return (
        <form className="w-sm mx-auto" action={formAction}>
            <FieldSet>
                <FieldLegend><h2>Create A New Club</h2></FieldLegend>
                <FieldDescription>Fill out the details below to create a new club.</FieldDescription>
                <FieldGroup>
                    <Field data-invalid={!!errors?.name}>
                        <FieldLabel htmlFor="name">Club Name</FieldLabel>
                        <FieldContent>
                            <Input autoComplete="off" aria-invalid={!!errors?.name} minLength={NAME_MIN_LENGTH} maxLength={NAME_MAX_LENGTH} type="text" placeholder="Name your club..." name="name" value={name} onChange={(e) => handleChange("name", e.target.value)}></Input>
                            <span>{name.length}/{NAME_MAX_LENGTH}</span>
                            {errors?.name?.map((error, index) => (
                                <FieldError key={index}>{error}</FieldError>
                            ))}
                        </FieldContent>


                    </Field>
                    <Field data-invalid={!!errors?.description}>
                        <FieldLabel htmlFor="description">Description</FieldLabel>
                        <FieldContent>
                            <Textarea
                                aria-invalid={!!errors?.description}
                                maxLength={DESCRIPTION_MAX_LENGTH}
                                placeholder="Describe your club..."
                                name="description"
                                value={description}
                                onChange={(e) => handleChange("description", e.target.value)} />
                            <span>{description.length}/{DESCRIPTION_MAX_LENGTH}</span>
                            {errors?.description?.map((error, index) => (
                                <FieldError key={index}>{error}</FieldError>
                            ))}
                        </FieldContent>
                    </Field>
                </FieldGroup>
                <FieldGroup>
                    <Field orientation="horizontal">
                        <Button type="submit" disabled={pending}>Create</Button>
                    </Field>
                </FieldGroup>
            </FieldSet>
        </form>
    )
}