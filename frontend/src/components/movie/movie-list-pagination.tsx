import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from "../ui/pagination";

export default function MovieListPagination({ page, totalPages }: { page: number, totalPages: number }) {
    return (
        <Pagination>
            <PaginationContent>
                {page > 1 && (
                    <PaginationItem>
                        <PaginationPrevious href={`?page=${page - 1}`} />
                    </PaginationItem>
                )}
                {Array.from({ length: totalPages }, (_, i) => (
                    <PaginationItem key={i}>
                        <PaginationLink href={`?page=${i + 1}`} isActive={i + 1 === page}>
                            {i + 1}
                        </PaginationLink>
                    </PaginationItem>
                ))}
                {page < totalPages && (
                    <PaginationItem>
                        <PaginationNext href={`?page=${page + 1}`} />
                    </PaginationItem>
                )}
            </PaginationContent>
        </Pagination>
    )
}