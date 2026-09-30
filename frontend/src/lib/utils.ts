import { redirect, RedirectType } from "next/navigation";

export { cn } from "cn"

export const redirectToLogin = () => {
    redirect('/login', RedirectType.replace);
};