import MovieList from "@/components/movie/movie-list";
import { auth } from "@/../auth";
import AddMovieButton from "@/components/add-movie/add-movie-button";
import { redirectToLogin } from "@/lib/common";

export default async function Home(props: PageProps<"/">) {
  const session = await auth();
  if (!session) {
    redirectToLogin();
  }
  const params = await props.searchParams
  const page = parseInt(params.page?.toString() || "1");

  return (
    <div>
      <main className="flex flex-col gap-4 p-4 mx-auto max-w-3xl lg:max-w-6xl">
        <AddMovieButton />
        <MovieList page={page} />
      </main>
    </div>
  );
}
