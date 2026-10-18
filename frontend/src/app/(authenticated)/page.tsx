import { auth } from "@/../auth";
import { redirectToLogin } from "@/lib/common";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (!session) {
    redirectToLogin();
  }
  redirect("/clubs");
}
