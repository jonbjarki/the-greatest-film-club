import { redirect, RedirectType } from "next/navigation";

export { cn } from "cn"

export const redirectToLogin = () => {
    redirect('/login', RedirectType.replace);
};

export const API_URL = process.env.VERCEL_ENV === "production"
    ? `https://${process.env.VERCEL_URL}/backend`
    : process.env.API_URL;