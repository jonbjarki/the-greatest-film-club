import { getClubsForUserAction } from "@/app/actions/club";
import { User } from "next-auth";


export default async function ClubsList({ user }: { user: User }) {
    const clubs = await getClubsForUserAction();
    return (
        <div>
            <ul>
                {clubs.length === 0 && <li>You have not joined any clubs yet!</li>}
                {clubs.map(club => (
                    <li key={club.id}>{club.name}</li>
                ))}
            </ul>
        </div>
    );
}