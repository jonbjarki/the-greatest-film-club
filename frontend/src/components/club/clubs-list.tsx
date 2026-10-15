import { getClubsForUserAction } from "@/app/actions/club";
import { User } from "next-auth";
import Link from "next/link";


export default async function ClubsList({ user }: { user: User }) {
    const clubs = await getClubsForUserAction();
    return (
        <div>
            <ul className="list-disc pl-5">
                {clubs.length === 0 && <li>You have not joined any clubs yet!</li>}
                {clubs.map(club => (
                    <li key={club.id}>
                        <Link href={`/clubs/view/${encodeURIComponent(club.normalized_name)}`}>
                            {club.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}