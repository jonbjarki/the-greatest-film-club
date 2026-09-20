"use server"
export async function signUp(initialState: any, formData: FormData) {
    console.log("FORM DATA", formData);
    const res = await fetch(process.env.API_URL + `/auth/register`, {
        method: "POST",
        body: formData
    });
    if (!res.ok) {
        throw new Error(`Failed to sign up: ${res.statusText}`);
    }
    return { message: "Sign up successful", error: false };
}