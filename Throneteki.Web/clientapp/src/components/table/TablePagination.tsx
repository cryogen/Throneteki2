import { Pagination } from '@nextui-org/react';

interface TablePaginationProps {
    pageCount: number;
    currentPage: number;
    setCurrentPage: (page: number) => void;
}

const TablePagination = ({ currentPage, pageCount, setCurrentPage }: TablePaginationProps) => {
    return (
        <>
            <Pagination
                classNames={{ base: 'p-3' }}
                total={Math.min(pageCount, 5)}
                showControls
                initialPage={currentPage}
                onChange={setCurrentPage}
            ></Pagination>
        </>
    );
};

export default TablePagination;
