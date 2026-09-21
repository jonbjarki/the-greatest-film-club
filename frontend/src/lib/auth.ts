import { redirect } from "next/navigation";
import { auth } from "../../auth";

export async function authenticatedFetch(input: RequestInfo | URL, init?: RequestInit) {
    const session = await auth();
    const token = session?.accessToken;
    const headers = new Headers(init?.headers || {});
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }
    const response = await fetch(input, { ...init, headers });

    if (!response.ok) {
        if (response.status === 401) {
            console.log("Unauthorized, redirecting to sign in");
            redirect("/api/auth/signin");
        }
    }
    return response;
}
