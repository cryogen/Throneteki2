import React from 'react';
import { Pagination } from 'react-bootstrap';

interface TablePaginationProps {
    disablePrevious: boolean;
    disableNext: boolean;
    pageCount: number;
    currentPage: number;
    setCurrentPage: (page: number) => void;
}

const TablePagination = ({
    currentPage,
    pageCount,
    setCurrentPage,
    disableNext,
    disablePrevious
}: TablePaginationProps) => {
    let isPageNumberOutOfRange: boolean;

    const pageNumbers = [...new Array(pageCount)].map((_, index) => {
        const pageNumber = index + 1;
        const isPageNumberFirst = pageNumber === 1;
        const isPageNumberLast = pageNumber === pageCount;
        const isCurrentPageWithinOnePageNumber = Math.abs(pageNumber - currentPage) <= 1;

        if (isPageNumberFirst || isPageNumberLast || isCurrentPageWithinOnePageNumber) {
            isPageNumberOutOfRange = false;
            return (
                <Pagination.Item
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    active={pageNumber === currentPage}
                >
                    {pageNumber}
                </Pagination.Item>
            );
        }

        if (!isPageNumberOutOfRange) {
            isPageNumberOutOfRange = true;
            return <Pagination.Ellipsis key={pageNumber} className='muted' />;
        }

        return null;
    });

    return (
        <>
            <Pagination className='mb-0'>
                <Pagination.Prev
                    onClick={() => {
                        setCurrentPage(currentPage - 1);
                    }}
                    disabled={disablePrevious}
                />
                {pageNumbers}
                <Pagination.Next
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={disableNext}
                />
            </Pagination>
        </>
    );
};

export default TablePagination;
