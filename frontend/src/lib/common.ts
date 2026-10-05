import { redirect, RedirectType } from "next/navigation";

export const redirectToLogin = () => {
    redirect('/login', RedirectType.replace);
};

export const API_URL = process.env.BACKEND_INTERNAL_URL ?? process.env.API_URL;