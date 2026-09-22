"use client"
import { DialogFooter } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signInAction } from "../actions/auth";
import { useActionState } from "react";

export default function Page() {
    const [state, formAction, pending] = useActionState(signInAction, { error: "" })

    return (
        <main className="h-full w-full flex flex-col items-center justify-center mt-10">
            <h2 className="mb-5 text-xl font-heading font-medium">LOGIN</h2>
            <form action={formAction} className="w-full max-w-xs flex flex-col gap-4">
                {state?.error && (
                    <div className="text-red-500 text-sm">{state.error}</div>
                )}
                <Field>
                    <FieldLabel className="text-base" htmlFor="username">Username</FieldLabel>
                    <Input id="username" name="username" type="text" autoComplete="username" />
                </Field>
                <Field>
                    <FieldLabel className="text-base" htmlFor="password">Password</FieldLabel>
                    <Input id="password" name="password" type="password" />
                </Field>
                <div className="flex justify-between">
                    <Button disabled={pending} type="submit">Sign In</Button>
                    <Link href="/register">Or Register</Link>
                </div>
            </form >
        </main >
    )
}