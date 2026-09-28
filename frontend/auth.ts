import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { LoginResponse } from "./src/lib/schemas";
import { JWT } from "next-auth/jwt";


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
                console.log("Authorizing credentials", credentials)
                if (
                    typeof credentials?.username !== "string" ||
                    typeof credentials?.password !== "string"
                ) {
                    console.error("Invalid credentials", credentials)
                    return null
                }
                try {
                    const body = new FormData()
                    body.append("username", credentials.username)
                    body.append("password", credentials.password)
                    console.log("Sending body", body)
                    const response = await fetch(process.env.API_URL + `/auth/login`, {
                        method: "POST",
                        body: body,
                    })
                    console.log("Received response", response)
                    console.log("Response body", await response.clone().text())
                    if (!response.ok) {
                        if (response.status === 401) {
                            console.error("Invalid username or password")
                            return null
                        } else {
                            console.error("Login failed", response.status, response.statusText)
                        }
                        return null
                    }

                    const data: LoginResponse = await response.json()

                    if (!data.access_token || !data.user) {
                        return null
                    }

                    return {
                        id: data.user.id.toString(),
                        username: data.user.username,
                        name: data.user.username,
                        accessToken: data.access_token,
                        refreshToken: data.refresh_token,
                        expires_at: Date.now() + data.expires_in * 1000,
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
    },

    callbacks: {
        async jwt({ token, user }) {
            // `user` is only present when the user initially signs in.
            if (user) {
                console.log("Token has been initialized", token)
                token.id = user.id!
                token.username = user.username
                token.accessToken = user.accessToken
                token.refreshToken = user.refreshToken
                token.expires_at = user.expires_at
            }
            else if (Date.now() < (token.expires_at as number)) {
                // Token is still valid, no need to update
                console.log("Token is still valid", token)
            }
            else if (Date.now() >= (token.expires_at as number)) {
                // Token has expired, must refresh
                console.log("Token has expired, refreshing...", token)
                token = await refreshAccessToken(token)
                console.log("New token after refresh", token)
                if (token.error) {
                    throw new Error("Error refreshing access token", token.error)
                }
            }
            return token
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.username = token.username as string
            }
            if (token) {
                session.accessToken = token.accessToken as string
                session.expires_at = token.accessTokenExpires as number
            }

            return session
        },
    },
})

async function refreshAccessToken(token: JWT) {
    try {
        const res = await fetch(process.env.API_URL + "/auth/refresh?refresh_token=" + token.refreshToken, {
            method: "POST",
            credentials: "include"
        });

        const refreshedTokens = await res.json();
        console.log("Refreshed tokens:", refreshedTokens)
        if (!res.ok) {
            throw refreshedTokens;
        }

        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            refreshToken: refreshedTokens.refresh_token,
            expires_at: Date.now() + refreshedTokens.expires_in * 1000,
        };
    } catch (error) {
        console.error("Error rotating access token:", error);

        return {
            ...token,
            // Tag the token with an error flag so the client knows it must re-authenticate
            error: "RefreshAccessTokenError",
        };
    }
}