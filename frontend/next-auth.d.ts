import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface User {
        accessToken: string
        expires_at: number
    }

    interface Session {
        user: {
            id: string
        } & DefaultSession["user"]
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        accessToken: string
        expires_at: number
    }
}
