import { auth } from "@/../auth";
import { notFound, redirect } from "next/navigation";
import { getUserByName } from "@/app/actions/user";
import ImageWithFallback from "@/components/profile/profile-image-with-fallback";
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button";
import EditProfileButton from "@/components/profile/edit-profile-button";

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
        <main className="flex flex-col items-center min-h-screen mt-8">
            <section className="flex flex-col lg:flex-row items-center text-center lg:text-left lg:gap-8">
                <div className="w-40 h-40 mb-4 rounded-full">
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
                    {isOwner && <EditProfileButton user={user} />}
                </div>
            </section>
        </main>
    );
}