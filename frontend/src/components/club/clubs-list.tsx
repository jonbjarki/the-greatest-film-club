import { User } from "next-auth";

export default function ClubsList({ user }: { user: User }) {
    return (
        <div>
            <p>Clubs for user: {user.name}</p>
        </div>
    );
}