import Header from "@/components/header/header";
import { auth } from "../../../auth";
import { redirect } from "next/navigation";

export default async function AuthenticatedLayout({ children }: LayoutProps<"/">) {
    const session = await auth();

    // Redirect to login if user is not authenticated
    if (!session) {
        redirect("/login");
    }

    return (
        <>
            <Header session={session} />
            {children}
        </>

    );
}