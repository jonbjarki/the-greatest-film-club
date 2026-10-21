import { redirect, RedirectType } from "next/navigation";
import { API_URL } from "@/lib/common";
import { getToken } from "next-auth/jwt";
import { headers } from "next/headers";

/**
Whether Auth.js uses the `__Secure-` session cookie for this request.
Mirrors Auth.js: it goes by the protocol of AUTH_URL, or of the incoming request when that isn't set.
*/
function usesSecureCookie(requestHeaders: Headers) {
    const envUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
    if (envUrl) {
        return new URL(envUrl).protocol === "https:";
    }
    return (requestHeaders.get("x-forwarded-proto") ?? "https") === "https";
}

/** Reads the backend session token out of the encrypted Auth.js session cookie. */
export async function getAccessToken() {
    const requestHeaders = await headers();
    const token = await getToken({
        req: { headers: requestHeaders },
        secret: process.env.AUTH_SECRET!,
        secureCookie: usesSecureCookie(requestHeaders),
    });
    return token?.accessToken ?? null;
}


/**
Utility function for making authenticated requests to the backend API.
It retrieves the backend session token from the encrypted session cookie and includes it in the Authorization header of the request.
On a 401 it ends the Auth.js session and sends the user to the login page.
*/
export async function authenticatedFetch(input: string, init?: RequestInit) {
    const accessToken = await getAccessToken();
    const requestHeaders = new Headers(init?.headers || {});
    if (accessToken) {
        requestHeaders.set("Authorization", `Bearer ${accessToken}`);
    }

    const res = await fetch(API_URL + input, {
        ...init,
        headers: requestHeaders
    });

    if (res.status === 401) {
        // The backend session is gone (expired or revoked). Server Components can't clear cookies,
        // so a route handler signs out of Auth.js and then redirects to /login.
        // redirect() works by throwing, so callers must not swallow it in a try/catch.
        redirect("/api/auth/expired", RedirectType.replace);
    }

    return res;
}
