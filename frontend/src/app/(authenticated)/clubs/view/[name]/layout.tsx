import { getClubByNameAction } from "@/app/actions/club";
import ClubHeader from "@/components/club/club-header";
import ClubTabs from "@/components/club/club-tabs";
import { isActiveMember } from "@/lib/club-permissions";
import { notFound } from "next/navigation";

export default async function ClubViewLayout(props: LayoutProps<"/clubs/view/[name]">) {
    const params = await props.params;
    const club = await getClubByNameAction(params.name);
    if (!club) {
        notFound();
    }
    return (
        <div className="flex flex-col gap-4">
            <ClubHeader club={club} />
            <ClubTabs normalizedName={club.normalized_name} isActiveMember={isActiveMember(club)} />
            <section className="pt-2">{props.children}</section>
        </div>
    );
}
