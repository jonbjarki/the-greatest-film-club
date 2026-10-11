"use client"
import { createClubAction, CreateClubActionState } from "@/app/actions/club";
import { CreateMovieNightActionState, createMovieNightAction } from "@/app/actions/movie-night";
import { useActionState, useEffect, useState } from "react";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { DESCRIPTION_MAX_LENGTH, NAME_MAX_LENGTH, NAME_MIN_LENGTH } from "@/schemas/club-schemas";

const initialState: CreateMovieNightActionState = {
    success: false,
};

export default function CreateMovieNightForm() {
    const [state, formAction, pending] = useActionState(createClubAction, initialState);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast.success(state.message)
            }
            else {
                toast.error(state.message)
            }
        }
    }, [state.message])

    const handleChange = (field: "name" | "description", value: string) => {
        if (field === "name") {
            setTitle(value);
        } else if (field === "description") {
            setDescription(value);
        }
        state.errors = undefined;
    };

    return (
        <form className="w-sm mx-auto" action={formAction}>
            <FieldSet>
                <FieldLegend><h2>Create A New Movie Night</h2></FieldLegend>
                <FieldDescription>Fill out the details below to create a new movie night.</FieldDescription>
                <FieldGroup>
                    <Field data-invalid={!!state.errors?.name && title.length >= NAME_MIN_LENGTH}>
                        <FieldLabel htmlFor="name">Movie Night Title</FieldLabel>
                        <FieldContent>
                            <Input autoComplete="off" aria-invalid={!!state.errors?.name && title.length >= NAME_MIN_LENGTH} minLength={NAME_MIN_LENGTH} maxLength={NAME_MAX_LENGTH} type="text" placeholder="Title your movie night..." name="name" value={title} onChange={(e) => handleChange("name", e.target.value)}></Input>
                            <span>{title.length}/{NAME_MAX_LENGTH}</span>
                            {state.errors?.name && state.errors.name.map((error, index) => (
                                <FieldError key={index}>{error}</FieldError>
                            ))}
                        </FieldContent>


                    </Field>
                    <Field data-invalid={!!state.errors?.description && description.length >= DESCRIPTION_MAX_LENGTH}>
                        <FieldLabel htmlFor="description">Description</FieldLabel>
                        <FieldContent>
                            <Textarea
                                aria-invalid={!!state.errors?.description && description.length >= DESCRIPTION_MAX_LENGTH}
                                maxLength={DESCRIPTION_MAX_LENGTH}
                                placeholder="Describe your club..."
                                name="description"
                                value={description}
                                onChange={(e) => handleChange("description", e.target.value)} />
                            <span>{description.length}/{DESCRIPTION_MAX_LENGTH}</span>
                            {state.errors?.description && state.errors.description.map((error, index) => (
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