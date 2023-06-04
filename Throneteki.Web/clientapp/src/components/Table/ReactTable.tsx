import React, { useEffect, useMemo, useState } from 'react';
import {
    ColumnFiltersState,
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    PaginationState,
    Row,
    SortingState,
    useReactTable,
    getSortedRowModel,
    TableOptions,
    ColumnFilter,
    ColumnSort
} from '@tanstack/react-table';
import { Table, Button, Alert } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';

import TablePagination from './TablePagination';
import TableHeader from './TableHeader';
import LoadingSpinner from '../LoadingSpinner';
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import FaIconButton from '../Site/FaIconButton';

interface DataLoadOptions {
    columnFilters: ColumnFilter[];
    pageIndex: number;
    pageSize: number;
    sorting: SortingState;
}

interface ReactTableProps<T> {
    columns: ColumnDef<T>[];
    defaultColumnFilters?: Record<string, string[]>;
    defaultSort?: ColumnSort;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLoadFn: (options: DataLoadOptions | unknown) => any;
    dataLoadArg?: unknown;
    dataProperty?: string;
    onRowClick?: (row: Row<T>) => void;
    onRowSelectionChange?: (rows: Row<T>[]) => void;
    remote?: boolean;
}

function ReactTable<T>({
    columns,
    dataLoadFn,
    dataLoadArg = null,
    dataProperty = 'data',
    defaultColumnFilters = {},
    defaultSort,
    onRowClick,
    onRowSelectionChange,
    remote = false
}: ReactTableProps<T>): JSX.Element {
    const { t } = useTranslation();

    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10
    });
    const [sorting, setSorting] = useState<SortingState>(defaultSort ? [defaultSort] : []);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const pagination = useMemo(
        () => ({
            pageIndex,
            pageSize
        }),
        [pageIndex, pageSize]
    );
    const [rowSelection, setRowSelection] = useState({});

    const fetchDataOptions = {
        columnFilters,
        pageIndex,
        pageSize,
        sorting
    };

    const {
        data: response,
        isLoading,
        isError,
        refetch
    } = dataLoadFn(dataLoadArg || fetchDataOptions);

    let tableOptions: TableOptions<T>;

    if (remote) {
        tableOptions = {
            data: response ? response[dataProperty] : null,
            columns,
            enableFilters: true,
            getCoreRowModel: getCoreRowModel(),
            manualFiltering: true,
            manualPagination: true,
            manualSorting: true,
            onPaginationChange: setPagination,
            onSortingChange: setSorting,
            onColumnFiltersChange: setColumnFilters,
            onRowSelectionChange: setRowSelection,
            pageCount: Math.ceil(response?.totalCount / pageSize) ?? -1,
            state: {
                sorting,
                pagination: pagination,
                columnFilters: columnFilters,
                rowSelection
            }
        };
    } else {
        tableOptions = {
            columns,
            data: response ? response[dataProperty] : null,
            getCoreRowModel: getCoreRowModel(),
            getFilteredRowModel: getFilteredRowModel(),
            getPaginationRowModel: getPaginationRowModel(),
            getSortedRowModel: getSortedRowModel(),
            onRowSelectionChange: setRowSelection,
            onSortingChange: setSorting,
            state: {
                rowSelection,
                sorting
            }
        };
    }

    const table = useReactTable(tableOptions);

    useEffect(() => {
        for (const [columnId, filter] of Object.entries(defaultColumnFilters)) {
            table.getColumn(columnId)?.setFilterValue(filter);
        }
    }, [defaultColumnFilters, table]);

    useEffect(() => {
        if (Object.values(rowSelection).length > 0) {
            onRowSelectionChange && onRowSelectionChange(table.getSelectedRowModel().flatRows);
        } else {
            onRowSelectionChange && onRowSelectionChange([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rowSelection]);

    if (isLoading) {
        return <LoadingSpinner text='Loading data, please wait...' />;
    } else if (isError) {
        return <Alert variant='danger'>{t('An error occurred loading data.')}</Alert>;
    } else if (response[dataProperty] && response[dataProperty].length === 0) {
        return <Alert variant='info'>{t('No data.')}</Alert>;
    }

    const currPage = table.getState().pagination.pageIndex + 1;
    const pageCount = table.getPageCount();
    const totalCount = remote ? response?.totalCount : response[dataProperty]?.length || 0;

    return (
        <>
            <div className='d-flex justify-content-between mb-3' onClick={() => refetch()}>
                <div></div>
                <div>
                    <FaIconButton variant='light' icon={faRefresh}></FaIconButton>
                </div>
            </div>
            <div className='table-scroll'>
                <Table striped variant='dark' bordered hover>
                    <thead>
                        <TableHeader headerGroups={table.getHeaderGroups()} />
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr
                                key={row.id}
                                onClick={() => {
                                    onRowClick && onRowClick(row);
                                }}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td
                                        key={cell.id}
                                        className={`col-${
                                            cell.column.columnDef.meta?.colWidth || '1'
                                        }`}
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
            <div className='mt-3 d-flex justify-content-between'>
                <div>
                    {[10, 25, 50].map((pageSize) => (
                        <Button
                            className='me-1'
                            variant={
                                pageSize === table.getState().pagination.pageSize
                                    ? 'primary'
                                    : 'dark'
                            }
                            key={pageSize}
                            onClick={() => table.setPageSize(pageSize)}
                        >
                            {pageSize}
                        </Button>
                    ))}
                </div>
                <div className='d-flex align-items-center'>
                    <span className='me-1'>
                        <Trans>
                            Page {{ currPage }} of {{ pageCount }} (
                            {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                { totalCount } as any
                            }{' '}
                            items)
                        </Trans>
                    </span>
                    <TablePagination
                        currentPage={table.getState().pagination.pageIndex + 1}
                        pageCount={table.getPageCount()}
                        disablePrevious={!table.getCanPreviousPage()}
                        disableNext={!table.getCanNextPage()}
                        setCurrentPage={(page) => table.setPageIndex(page - 1)}
                    />
                </div>
            </div>
        </>
    );
}

export default ReactTable;
