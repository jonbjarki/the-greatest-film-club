"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Field, FieldDescription, FieldLabel } from "../ui/field";
import { useState } from "react";

export default function SignInButton() {
    const [isSignIn, setIsSignIn] = useState(true);
    const toggleMode = () => {
        setIsSignIn(x => !x);
    }
    return (
        <Dialog>
            <DialogTrigger>Sign In</DialogTrigger>
            <DialogContent>
                {isSignIn ? <SignInForm toggleMode={toggleMode} /> : <SignUpForm toggleMode={toggleMode} />}
            </DialogContent>
        </Dialog>
    )
}

function SignInForm({ toggleMode }: { toggleMode: () => void }) {
    return (
        <form>
            <DialogHeader className="mb-6">
                <DialogTitle>Log in</DialogTitle>
            </DialogHeader>
            <Field>
                <FieldLabel htmlFor="password">Username</FieldLabel>
                <Input id="username" type="text" autoComplete="username" />
            </Field>
            <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input id="password" type="password" />
            </Field>
            <DialogFooter className="mt-4">
                <Button type="submit">Log In</Button>
                <Button variant={"secondary"} onClick={toggleMode}>or Sign Up</Button>
            </DialogFooter>
        </form>
    )
}

function SignUpForm({ toggleMode }: { toggleMode: () => void }) {
    return (
        <form>
            <DialogHeader className="mb-6">
                <DialogTitle>Sign Up</DialogTitle>
            </DialogHeader>
            <Field>
                <FieldLabel htmlFor="password">Username</FieldLabel>
                <Input id="username" type="text" autoComplete="username" />
            </Field>
            <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input id="password" type="password" />
            </Field>
            <DialogFooter className="mt-4">
                <Button type="submit">Sign Up</Button>
                <Button variant={"secondary"} onClick={toggleMode}>or Log In</Button>
            </DialogFooter>
        </form>
    )
}