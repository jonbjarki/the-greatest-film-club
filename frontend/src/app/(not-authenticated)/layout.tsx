import HomeHeader from "@/components/header/home-header";

export default function NotAuthenticatedLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <HomeHeader />
            {children}
        </div>
    )
}