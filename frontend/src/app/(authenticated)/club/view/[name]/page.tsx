import { getClubByNameAction } from "@/app/actions/club";
import { notFound } from "next/navigation";

export default async function ClubPage(props: PageProps<"/club/view/[name]">) {
    const params = await props.params;
    const clubName = decodeURIComponent(params.name);

    const club = await getClubByNameAction(clubName);
    if (!club) {
        notFound();
    }
    return (
        <div>
            <h1>{club.name}</h1>
            <p>{club.description}</p>
        </div>
    );
}