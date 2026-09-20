"use client"
import { DialogFooter } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signUp } from "../actions/auth";
import { useActionState } from "react";

const initialState = {
    message: '',
    error: false
}

export default function Page() {
    const [state, formAction, pending] = useActionState(signUp, initialState)
    return (
        <form action={formAction} className="w-fit">
            <Field>
                <FieldLabel htmlFor="password">Username</FieldLabel>
                <Input id="username" name="username" type="text" autoComplete="username" />
            </Field>
            <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input id="password" name="password" type="password" />
            </Field>
            <DialogFooter className="mt-4">
                <Button type="submit">Sign Up</Button>
                <Link href="/login">Or Sign In</Link>
            </DialogFooter>
        </form>
    )
}