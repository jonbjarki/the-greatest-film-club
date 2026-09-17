import SignInButton from "@/components/auth/sign-in-button";
import MovieList from "@/components/movie/movie-list";
import { auth } from "../../auth";
import Link from "next/link";
import { Button } from "@/components/ui/button"

export default async function Home() {
  const session = await auth();
  return (
    <div>
      <header className="w-full h-30 flex justify-center items-center bg-linear-to-r from-primary/20 to-primary/40">
        <h1 className="text-3xl font-bold">The Greatest Film Club</h1>
        {!session?.user && <Link href={"/api/auth/signin"} className="ml-8"><Button>Log In</Button></Link>}
      </header>
      <main className="flex flex-col gap-4 p-4 mx-auto max-w-3xl lg:max-w-6xl">
        <MovieList />
      </main>
    </div>
  );
}
