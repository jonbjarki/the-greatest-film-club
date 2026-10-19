import Image from "next/image";


function getInitials(name: string | null | undefined) {
    if (!name) return "";
    const names = name.split(" ");
    const initials = names.map(n => n[0].toUpperCase()).join("");
    return initials.substring(0, 2);
}

interface ImageWithFallbackProps {
    alt: string;
    username: string;
    size: "small" | "large";
    src: string;
}

export default function ProfileImageWithFallback({ src, alt, username, size }: ImageWithFallbackProps) {
    const initials = getInitials(username);
    return (
        <span className={`relative w-full h-full flex items-center justify-center rounded-full overflow-hidden ${size === "small" ? "text-xl" : "text-6xl"}`}>
            {src !== "" ?
                <Image src={src} alt={alt} className="object-cover" sizes={size === "small" ? "56px" : "176px"} fill />
                :
                <div className="w-full h-full flex items-center justify-center rounded-full bg-gray-300 text-gray-700">{initials}</div>
            }
        </span>
    )
}