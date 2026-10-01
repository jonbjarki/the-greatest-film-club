import { User } from "next-auth";
import Image from "next/image";
import ImageWithFallback from "../common/image-with-fallback";

function getInitials(name: string | null | undefined) {
    if (!name) return "";
    const names = name.split(" ");
    const initials = names.map(n => n[0].toUpperCase()).join("");
    return initials.substring(0, 2);
}

export default function ProfileIcon({ user }: { user: User }) {
    const userInitials = getInitials(user.name);

    return (
        <div className="h-12 w-12 cursor-pointer rounded-full overflow-hidden">
            <ImageWithFallback
                src={user.image ?? ""}
                alt={`Profile image for ${user.name}`}
                fallbackText={userInitials}
            />
        </div>
    )
}