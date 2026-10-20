import Link from "next/link";
import { Button } from "../ui/button";

export default function HomeHeader() {
    return (
        <header className="w-full h-18 bg-accent">
            <div className="mx-auto max-w-5xl h-full px-6 flex items-center justify-between gap-4">
                <Link href="/" className="text-2xl font-heading font-bold text-primary">TGFC</Link>
                <nav aria-label="Main" className="flex items-center gap-1">
                    <Link href="/login" className="px-3.5 py-3 hover:underline underline-offset-2">Log in</Link>
                    <Button asChild className="rounded-lg h-10 px-4.5 text-base font-normal">
                        <Link href="/register">Register</Link>
                    </Button>
                </nav>
            </div>
        </header>
    );
}