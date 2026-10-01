import Header from "@/components/header/header";

export default function AuthenticatedLayout({ children }: LayoutProps<"/">) {
    return (
        <>
            <Header />
            {children}
        </>

    );
}