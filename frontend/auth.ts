import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { loginResponseSchema } from "./src/schemas/auth-schemas";
import { API_URL } from "@/lib/common";

// Must match SESSION_LIFETIME on the backend
const SESSION_MAX_AGE = 30 * 24 * 60 * 60

// Pages that only make sense when logged out
const AUTH_PAGES = ["/login", "/register"]
// Pages anyone can see
const PUBLIC_PAGES = ["/", ...AUTH_PAGES]

export const { handlers, signIn, signOut, auth } = NextAuth({
    pages: {
        signIn: "/login",
    },
    providers: [
        Credentials({
            name: "username",
            credentials: {
                username: {
                    label: "Username",
                    type: "text",
                },
                password: {
                    label: "Password",
                    type: "password",
                },
            },

            async authorize(credentials) {
                if (
                    typeof credentials?.username !== "string" ||
                    typeof credentials?.password !== "string"
                ) {
                    console.error("Invalid credentials")
                    return null
                }
                try {
                    const body = new URLSearchParams({ "username": credentials.username, "password": credentials.password })
                    const response = await fetch(API_URL + `/auth/login`, {
                        method: "POST",
                        body: body,
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        },
                    })
                    if (!response.ok) {
                        if (response.status === 401) {
                            console.error("Invalid username or password")
                            return null
                        } else {
                            console.error("Login failed", response.status, response.statusText)
                        }
                        return null
                    }

                    const result = loginResponseSchema.safeParse(await response.json())
                    if (!result.success) {
                        console.error("Unexpected login response", result.error)
                        return null
                    }
                    const data = result.data

                    return {
                        id: data.user.id,
                        accessToken: data.access_token,
                        expires_at: Date.parse(data.expires_at),
                    }

                } catch (error) {
                    console.error("Error occured when logging in with backend", error)
                    return null
                }
            },
        }),
    ],

    session: {
        strategy: "jwt",
        maxAge: SESSION_MAX_AGE,
    },

    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            if (AUTH_PAGES.includes(nextUrl.pathname)) {
                return isLoggedIn ? Response.redirect(new URL("/clubs", nextUrl)) : true
            }
            // Everything else needs a session; returning false redirects to the sign-in page
            return isLoggedIn || PUBLIC_PAGES.includes(nextUrl.pathname)
        },

        async jwt({ token, user }) {
            // `user` is only present when the user initially signs in.
            if (user) {
                token.id = user.id!
                token.accessToken = user.accessToken
                token.expires_at = user.expires_at
            }

            // The backend session has expired, so end this one too. Returning null clears the cookie.
            if (Date.now() >= token.expires_at) {
                return null
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id
            }

            return session
        },
    },

    events: {
        async signOut(message) {
            // Revoke the backend session too, so the token stops working immediately
            const accessToken = "token" in message ? message.token?.accessToken : undefined
            if (!accessToken) return
            try {
                await fetch(API_URL + `/auth/logout`, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${accessToken}` },
                })
            } catch (error) {
                console.error("Failed to revoke backend session", error)
            }
        },
    },
})
