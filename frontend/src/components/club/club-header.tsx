import { ClubMetadata } from "@/schemas/club-schemas";
import { Badge } from "../ui/badge";

export default function ClubHeader({ club }: { club: ClubMetadata }) {
    return (
        <section className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
                <h1 className="text-3xl font-heading font-bold">{club.name}</h1>
                {club.member && <Badge variant="secondary" className="capitalize">{club.member.role}</Badge>}
            </div>
            {club.description && <p className="text-muted-foreground line-clamp-2 max-w-prose">{club.description}</p>}
        </section>
    );
}
