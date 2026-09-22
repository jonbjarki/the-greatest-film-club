"use client"
import type { SignUpState } from "../actions/auth";
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signUpAction } from "../actions/auth";
import { useActionState } from "react";

const initialState: SignUpState = {
    error: null,
    message: "",
}

export default function Page() {
    const [state, formAction, pending] = useActionState(signUpAction, initialState)
    return (
        <main className="h-full w-full flex flex-col items-center justify-center mt-10">
            <h2 className="mb-5 text-xl font-heading font-medium">REGISTER</h2>
            <form action={formAction} className="w-full max-w-xs flex flex-col gap-4">
                <Field>
                    <FieldLabel className="text-base" htmlFor="username">Username</FieldLabel>
                    <Input id="username" name="username" type="text" autoComplete="username" />
                    {state.errors?.fieldErrors.username?.map(error =>
                        <FieldError key={error} className="text-xs">{error}</FieldError>
                    )}
                </Field>
                <Field>
                    <FieldLabel className="text-base" htmlFor="password">Password</FieldLabel>
                    <Input id="password" name="password" type="password" />
                    {state.errors?.fieldErrors.password?.map(error =>
                        <FieldError key={error} className="text-xs">{error}</FieldError>
                    )}
                </Field>
                <div className="flex justify-between">
                    <Button disabled={pending} type="submit">Sign Up</Button>
                    <Link href="/login">Or Sign In</Link>
                </div>
            </form >
        </main >
    )
}