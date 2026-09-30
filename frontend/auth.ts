import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { LoginResponse } from "./src/lib/schemas";

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
                    const body = new FormData()
                    body.append("username", credentials.username)
                    body.append("password", credentials.password)
                    const response = await fetch(process.env.API_URL + `/auth/login`, {
                        method: "POST",
                        body: body,
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

                    const data: LoginResponse = await response.json()

                    if (!data.access_token || !data.user) {
                        return null
                    }

                    return {
                        id: data.user.id.toString(),
                        username: data.user.username,
                        name: data.user.username,
                        accessToken: data.access_token,
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
                token.id = user.id!
                token.username = user.username
                token.accessToken = user.accessToken
                token.expires_at = user.expires_at
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.username = token.username as string
            }

            return session
        },
    },
})