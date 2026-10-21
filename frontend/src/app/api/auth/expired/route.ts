import { signOut } from "@/../auth"

/**
The backend rejected the session token. Clear the Auth.js session cookie (which
Server Components can't do) and send the user to the login page.
*/
export async function GET() {
    await signOut({ redirectTo: "/login" })
}
