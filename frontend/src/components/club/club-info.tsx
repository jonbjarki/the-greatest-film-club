import { ClubMetadata } from "@/schemas/club-schemas";
import Link from "next/link";
import { Badge } from "../ui/badge";

export default function ClubInfo({ club }: { club: ClubMetadata }) {
    return (
        <section className="mb-8 text-center">
            <h1 className="text-3xl font-medium mb-2">{club.name}</h1>
            {club.member && <Badge variant="secondary" className="capitalize">{club.member.role}</Badge>}
            <p className="mt-3 text-muted-foreground">{club.description || "This club has no description."}</p>
        </section>
    );
}
