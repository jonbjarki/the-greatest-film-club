import { redirect, RedirectType } from "next/navigation";

export { cn } from "cn"

export const redirectToLogin = () => {
    redirect('/login', RedirectType.replace);
};

export const API_URL = process.env.BACKEND_INTERNAL_URL ?? process.env.API_URL;
console.log("Backend URL configured:", Boolean(process.env.BACKEND_INTERNAL_URL));
console.log("API_URL being used:", API_URL?.substring(0, 14) + "...");