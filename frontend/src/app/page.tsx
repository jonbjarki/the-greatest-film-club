import MovieList from "@/components/movie/movie-list";
import { auth, signOut } from "../../auth";
import Link from "next/link";
import { Button } from "@/components/ui/button"
import AddMovieButton from "@/components/add-movie/add-movie-button";
import SignOutButton from "@/components/auth/sign-out-button";

export default async function Home(props: PageProps<"/">) {
  const session = await auth();
  const params = await props.searchParams
  const page = parseInt(params.page?.toString() || "1");

  return (
    <div>
      <header className="w-full h-30 flex justify-center items-center bg-linear-to-r from-primary/20 to-primary/40">
        <Link href="/"><h1 className="text-3xl font-bold">The Greatest Film Club</h1></Link>
        {!session?.user ? <Link href={"/api/auth/signin"} className="ml-8"><Button>Log In</Button></Link> : <SignOutButton />}
      </header>
      <main className="flex flex-col gap-4 p-4 mx-auto max-w-3xl lg:max-w-6xl">
        <AddMovieButton />
        <MovieList page={page} />
      </main>
    </div>
  );
}
