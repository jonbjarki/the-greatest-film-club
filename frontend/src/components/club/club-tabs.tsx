"use client"

import { cn } from "@/lib/utils";
import { Clapperboard, House, Settings } from "lucide-react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

const tabs = [
    { segment: null, label: "Home", icon: House },
    { segment: "movie-nights", label: "Movie Nights", icon: Clapperboard },
    { segment: "settings", label: "Settings", icon: Settings, requiresMembership: true },
];

export default function ClubTabs({ normalizedName, isActiveMember }: { normalizedName: string; isActiveMember: boolean }) {
    // Active child segment of the club layout: null (home), "movie-nights" or "settings"
    const activeSegment = useSelectedLayoutSegment();
    const baseHref = `/clubs/view/${encodeURIComponent(normalizedName)}`;

    return (
        <nav className="flex gap-1 overflow-x-auto overflow-y-hidden border-b">
            {tabs.filter((tab) => !tab.requiresMembership || isActiveMember).map(({ segment, label, icon: Icon }) => {
                const isActive = segment === activeSegment;
                return (
                    <Link
                        key={label}
                        href={segment ? `${baseHref}/${segment}` : baseHref}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                            "relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                            "after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-primary after:opacity-0 after:transition-opacity",
                            isActive ? "text-foreground after:opacity-100" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Icon className="size-4" />
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}
