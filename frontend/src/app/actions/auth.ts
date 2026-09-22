"use server"
import { credentialsSchema } from "@/lib/schemas";
import { signIn } from "@/../auth";
import z from "zod";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export type SignUpState = {
    error: string | null,
    message: string,
    errors?: {
        fieldErrors: {
            username?: string[],
            password?: string[]
        }
    }
}

export type SignInState = {
    error: string,
}

export async function signUpAction(_state: SignUpState, formData: FormData): Promise<SignUpState> {
    const data = {
        username: formData.get("username"),
        password: formData.get("password")
    }

    console.log("data", data);
    const result = await credentialsSchema.safeParseAsync(data);
    console.log(result);
    if (!result.success) {
        const errors = z.flattenError(result.error);
        return {
            error: null,
            message: "",
            errors
        }
    }

    const res = await fetch(process.env.API_URL + `/auth/register`, {
        method: "POST",
        body: formData
    });
    console.log(res);
    const resData = await res.json();
    console.log(resData);
    if (!res.ok) {
        if (res.status == 400) {
            return {
                error: "User already exists",
                message: ""
            }
        }
        throw new Error(`Failed to sign up: ${res.statusText}`);
    }

    await signIn("credentials", {
        username: formData.get("username"),
        password: formData.get("password"),
        redirectTo: "/"
    });

    return {
        error: null,
        message: "",
    };
}

export async function signInAction(_state: SignInState, formData: FormData) {
    try {
        await signIn("credentials", {
            username: formData.get("username"),
            password: formData.get("password"),
            redirect: false // Enables catching errors without automatic redirection
        })
    } catch (error) {
        if (error instanceof AuthError) {
            return {
                error: "Invalid username or password"
            }
        }
        throw error
    }
    // Redirect to the home page after successful sign-in.
    redirect("/");
}