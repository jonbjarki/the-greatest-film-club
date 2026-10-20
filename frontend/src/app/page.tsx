import { auth } from "@/../auth";
import HomeHeader from "@/components/header/home-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";

const steps = [
    {
        title: "Make a club",
        body: "Give it a name, say what it's about, and invite your friends by username.",
    },
    {
        title: "Plan a movie night",
        body: "Pick a night and set a deadline for voting.",
    },
    {
        title: "Add films and vote",
        body: "Everyone adds films they like, then votes for what they want to watch. Once voting closes, you have the perfect list to pick from.",
    },
];

export default async function Home() {
    const session = await auth();
    if (session) {
        redirect("/clubs");
    }

    return (
        <div className="min-h-screen flex flex-col">
            <HomeHeader />
            <main className="flex-1">
                <section className="mx-auto max-w-5xl px-6 pt-28 pb-24 flex flex-col gap-8">
                    <h1 className="max-w-4xl text-[clamp(3rem,8vw,6.5rem)] leading-[0.98] font-bold tracking-tight">
                        The Greatest <span className="text-primary">Film Club</span>
                    </h1>
                    <p className="max-w-xl text-[1.375rem] leading-normal text-muted-foreground">
                        Picking a movie shouldn't take longer than watching one. Start a club, bring your friends in, and settle it with a vote.
                    </p>
                    <div className="flex flex-wrap items-center gap-6">
                        <Button asChild className="rounded-lg h-12 px-6 text-lg font-normal">
                            <Link href="/register">Create a club</Link>
                        </Button>
                        <Link href="/login" className="py-3 text-lg text-primary underline underline-offset-4 hover:text-primary/80">or log in</Link>
                    </div>
                </section>

                <section className="mx-auto max-w-5xl px-6 pb-26">
                    <h2 className="mb-2 text-3xl font-semibold">How it works</h2>
                    <ol className="border-t border-foreground">
                        {steps.map((step, i) => (
                            <li key={step.title} className="flex flex-wrap gap-x-12 gap-y-2 py-7 border-b">
                                <div className="basis-70 shrink-0 flex items-baseline gap-5">
                                    <span className="text-2xl text-primary">{i + 1}.</span>
                                    <span className="text-[1.625rem] font-semibold">{step.title}</span>
                                </div>
                                <p className="flex-[1_1_20rem] text-lg leading-relaxed text-muted-foreground">{step.body}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="bg-accent">
                    <div className="mx-auto max-w-5xl px-6 py-20 flex flex-wrap items-center justify-between gap-8">
                        <div className="flex-[1_1_30rem] min-w-0 flex flex-col gap-3">
                            <h2 className="text-[clamp(2rem,4.5vw,3rem)] leading-tight font-bold">
                                Your friend group can&apos;t agree on a movie?
                            </h2>
                            <p className="text-xl text-muted-foreground">Create a club and put it to a vote</p>
                        </div>
                        <Button asChild className="rounded-lg h-12 px-6.5 text-lg font-normal">
                            <Link href="/register">Create an account</Link>
                        </Button>
                    </div>
                </section>
            </main>

            <footer>
                <div className="mx-auto max-w-5xl p-6 flex flex-wrap items-center justify-between gap-3">
                    <span className="font-bold text-primary">TGFC</span>
                    <span className="text-sm text-muted-foreground">Movie data from TMDB. Not endorsed or certified by TMDB.</span>
                </div>
            </footer>
        </div>
    );
}
