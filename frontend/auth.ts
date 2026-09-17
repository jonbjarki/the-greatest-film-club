import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import z from "zod"

import { credentialsSchema, LoginResponse, loginResponseSchema, passwordSchema } from "./src/lib/schemas";

export const { handlers, signIn, signOut, auth } = NextAuth({
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
                        console.error("Login failed", response.status, response.statusText)
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
                        accessTokenExpires: Date.now() + data.expires_in * 1000,
                    }

                } catch (error) {
                    console.error("Error occured when logging in with backend", error);
                    return null;
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
                token.id = user.id
                token.username = user.username
                token.accessToken = user.accessToken
                token.accessTokenExpires = user.accessTokenExpires
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
                session.accessTokenExpires = token.accessTokenExpires as number
            }

            return session
        },
    },
})