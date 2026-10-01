import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface User {
        username: string
        accessToken: string
        expires_at: number
    }

    interface Session {
        user: {
            id: string
            username: string
        } & DefaultSession["user"]
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        username: string
        accessToken: string
        expires_at: number
    }
}