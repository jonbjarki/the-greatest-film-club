import { redirect } from "next/navigation"
import { signOut } from "@/../auth"
import { API_URL } from "@/lib/common"
import { getAccessToken } from "@/lib/auth"

/**
The backend rejected the session token. Clear the Auth.js session cookie (which
Server Components can't do) and send the user to the login page.

This is a GET so authenticatedFetch can redirect here, which means any site can link to it.
To stop that being used to force a logout, only sign out when the backend really rejects the token.
*/
export async function GET() {
    const accessToken = await getAccessToken()
    if (accessToken) {
        const res = await fetch(API_URL + "/users/me", {
            headers: { "Authorization": `Bearer ${accessToken}` },
        })
        if (res.status !== 401) {
            redirect("/clubs")
        }
    }
    await signOut({ redirectTo: "/login" })
}
