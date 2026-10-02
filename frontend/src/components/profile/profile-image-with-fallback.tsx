import Image from "next/image";


function getInitials(name: string | null | undefined) {
    if (!name) return "";
    const names = name.split(" ");
    const initials = names.map(n => n[0].toUpperCase()).join("");
    return initials.substring(0, 2);
}

interface ImageWithFallbackProps extends React.ComponentProps<typeof Image> {
    alt: string;
    username: string;
    size: "small" | "large"
}

export default function ProfileImageWithFallback({ src, alt, username, size, ...imageProps }: ImageWithFallbackProps) {
    const initials = getInitials(username);
    return (
        <div className={`w-full h-full flex items-center justify-center ${size === "small" ? "text-xl" : "text-6xl"}`}>
            {src !== "" ?
                <Image {...imageProps} src={src} alt={alt} fill />
                :
                <div className="w-full h-full flex items-center justify-center rounded-full bg-gray-300 text-gray-700">{initials}</div>
            }

        </div>
    )
}