import { User } from "next-auth";
import Image from "next/image";
import ProfileImageWithFallback from "./profile-image-with-fallback";
import { UserProfile } from "@/lib/schemas";

export default function ProfileIcon({ user }: { user: UserProfile }) {

    return (
        <div className="h-14 w-14 p-1 cursor-pointer rounded-full border">
            <ProfileImageWithFallback
                size="small"
                src={user.image_url ?? ""}
                alt={`Profile image for ${user.username}`}
                username={user.username ?? ""}
            />
        </div>
    )
}