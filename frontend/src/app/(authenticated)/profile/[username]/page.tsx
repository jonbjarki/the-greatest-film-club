import { auth } from "@/../auth";
import { notFound, redirect } from "next/navigation";
import { getUserByName } from "@/app/actions/user";
import ImageWithFallback from "@/components/profile/profile-image-with-fallback";
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button";
import EditProfileForm from "@/components/profile/edit-profile-button";

export default async function ProfilePage(props: PageProps<"/profile/[username]">) {
    const session = await auth();
    const username = (await (props.params)).username;

    if (!session || !session.user) {
        redirect("/login");
    }
    if (!username || username.trim() === "") {
        notFound();
    }
    const user = await getUserByName(username) ?? notFound();
    const isOwner = session.user.id === user.id;

    console.log(user);
    return (
        <main className="flex flex-col items-center min-h-screen mt-8 max-w-md mx-auto gap-4 sm:gap-0">
            <section className="flex flex-col lg:flex-row items-center text-center lg:text-left lg:gap-8">
                <div className="relative w-44 h-44 mb-4 rounded-full border border-foreground">
                    <ImageWithFallback
                        size="large"
                        src={user.image_url ?? ""}
                        alt={user.username}
                        username={user.username ?? ""}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-medium">{user.username}</h2>
                    <p className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4" />Joined {user.created_at.toLocaleDateString('default', { month: 'short', year: 'numeric' })}</p>
                    {isOwner && <EditProfileForm user={user} />}
                </div>
            </section>
            <div className="flex flex-col p-4 rounded-lg w-full bg-accent mx-4 sm:m-0">
                <h2 className="text-xl font-medium text-left mb-4">About</h2>
                <p className="text-sm">{user.bio || "This user has no bio."}</p>
            </div>
        </main>
    );
}