import { redirect, RedirectType } from "next/navigation";
import { API_URL, redirectToLogin } from "@/lib/utils";
import { decode, getToken } from "next-auth/jwt";
import { cookies } from "next/headers";


export class NotAuthenticatedError extends Error {
    constructor() {
        super();
        this.name = 'NotAuthenticatedError';
        Object.setPrototypeOf(this, NotAuthenticatedError.prototype);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, NotAuthenticatedError);
        }
    }
}

async function getDecodedToken() {
    // Retrieve the encoded authjs session token from cookies
    const cookieStore = await cookies();

    const cookieName = process.env.NODE_ENV === "production" ? "__Secure-authjs.session-token" : "authjs.session-token";
    console.log("COOKIE NAME:", cookieName);
    console.log("NODE ENV:", process.env.NODE_ENV);
    const sessionCookie = cookieStore.get(cookieName)?.value;

    if (!sessionCookie) return null;

    // Decode the session cookie to extract the JWT token
    const decodedToken = await decode({
        token: sessionCookie,
        secret: process.env.AUTH_SECRET!,
        salt: cookieName, // Use the cookie name as salt for decoding
    });
    console.log("DECODED TOKEN:", decodedToken);
    console.log("ACCESS TOKEN: ", Boolean(decodedToken?.accessToken));

    if (!decodedToken) {
        return null;
    }

    return decodedToken.accessToken;
}


/**
Utility function for making authenticated requests to the backend API.
It retrieves the JWT from the encoded session cookie and includes it in the Authorization header of the request. 
*/
export async function authenticatedFetch(input: string, init?: RequestInit) {
    const accessToken = await getDecodedToken();
    const headers = new Headers(init?.headers || {});
    if (accessToken) {
        // If we have a valid access token, include it in the Authorization header
        headers.set("Authorization", `Bearer ${accessToken}`);
    }

    console.log("Making authenticated request to: " + input + " with configuration ", init);
    // Make the authenticated request to the backend API, including the JWT in the Authorization header if available
    const res = await fetch(API_URL + input, {
        ...init,
        headers
    });

    if (res.status === 401) {
        // If the response status is 401 (Unauthorized), redirect to the sign-in page
        redirectToLogin();
    }

    return res;
}
