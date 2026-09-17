import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface User {
        username: string
        accessToken: string
        accessTokenExpires: number
    }

    interface Session {
        user: {
            id: string
            username: string
        } & DefaultSession["user"]

        accessToken?: string
        accessTokenExpires?: number
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        username: string
        accessToken: string
        accessTokenExpires: number
    }
}