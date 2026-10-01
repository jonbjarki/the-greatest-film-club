import Image from "next/image";

interface ImageWithFallbackProps extends React.ComponentProps<typeof Image> {
    alt: string;
    fallbackText: string;
}

export default function ImageWithFallback({ src, alt, fallbackText, ...imageProps }: ImageWithFallbackProps) {
    return (
        <div className="w-full h-full flex items-center justify-center">
            {src !== "" ?
                <Image {...imageProps} src={src} alt={alt} />
                :
                <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-700">{fallbackText}</div>
            }

        </div>
    )
}