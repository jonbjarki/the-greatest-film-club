export type MovieType = {
    id: number;
    name: string;
    release_year: number;
    genres: string[];
    director_names: string[];
    actor_names: string[];
    description: string;
    backdrop_url: string;
    poster_url: string;
    user_id: number;
    added_at: Date;
    vote_count: number;
}