import { auth } from "@/../auth";
import AddMovieButton from "@/components/add-movie/add-movie-button";
import { redirectToLogin } from "@/lib/common";
import MovieListContainer from "@/components/movie/movie-list-container";

export default async function Home() {
  const session = await auth();
  if (!session) {
    redirectToLogin();
  }

  return (
    <div>
      <main className="flex flex-col gap-4 p-4 mx-auto max-w-3xl lg:max-w-6xl">
        <h2>Home Page!</h2>
      </main>
    </div>
  );
}
