import { auth } from "../../auth";

export async function authenticatedFetch(input: RequestInfo, init?: RequestInit) {
    const session = await auth();
    const token = session?.accessToken;
    console.log("Token:", token);
    const headers = new Headers(init?.headers || {});
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }
    return fetch(input, { ...init, headers });
}
