import ProfileImageWithFallback from "./profile-image-with-fallback";
import { UserProfile } from "@/schemas/user-schemas";

export default function ProfileIcon({ user }: { user: UserProfile }) {

    return (
        <div className="h-14 w-14 cursor-pointer rounded-full border p-1">
            <ProfileImageWithFallback
                size="small"
                src={user.image_url ?? ""}
                alt={`Profile image for ${user.username}`}
                username={user.username ?? ""}
            />
        </div>
    )
}