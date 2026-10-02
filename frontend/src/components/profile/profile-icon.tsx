import { User } from "next-auth";
import Image from "next/image";
import ProfileImageWithFallback from "./profile-image-with-fallback";

export default function ProfileIcon({ user }: { user: User }) {

    return (
        <div className="h-12 w-12 cursor-pointer rounded-full overflow-hidden">
            <ProfileImageWithFallback
                size="small"
                src={user.image ?? ""}
                alt={`Profile image for ${user.name}`}
                username={user.name ?? ""}
            />
        </div>
    )
}