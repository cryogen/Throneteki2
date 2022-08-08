import React, { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Alert, Button, Form, InputGroup, Table } from 'react-bootstrap';
import {
    faFileCirclePlus,
    faDownload,
    faRefresh,
    faArrowUpLong,
    faArrowDownLong,
    faMagnifyingGlass,
    faTimes
} from '@fortawesome/free-solid-svg-icons';
import { LinkContainer } from 'react-router-bootstrap';

import Panel from '../../components/Site/Panel';
import FaIconButton from '../Site/FaIconButton';
import { useGetDecksQuery } from '../../redux/api/apiSlice';
import LoadingSpinner from '../LoadingSpinner';
import { Deck } from '../../types/decks';
import {
    getCoreRowModel,
    flexRender,
    useReactTable,
    SortingState,
    ColumnDef,
    PaginationState,
    ColumnFiltersState
} from '@tanstack/react-table';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TablePagination from '../Site/TablePagination';
import DebouncedInput from '../Site/DebouncedInput';

const Decks = () => {
    const { t } = useTranslation();
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10
    });
    const [sorting, setSorting] = useState<SortingState>([
        {
            id: 'updated',
            desc: true
        }
    ]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const fetchDataOptions = {
        columnFilters,
        pageIndex,
        pageSize,
        sorting
    };

    const { data, isLoading, isError } = useGetDecksQuery(fetchDataOptions);

    const columns = useMemo<ColumnDef<Deck>[]>(
        () => [
            {
                accessorKey: 'name',
                header: t('Name') as string
            },
            {
                accessorKey: 'faction',
                header: t('Faction') as string
            },
            {
                accessorKey: 'created',
                cell: (info) =>
                    moment(info.getValue() as Date)
                        .local()
                        .format('YYYY-MM-DD HH:mm'),
                header: t('Created') as string
            },
            {
                accessorKey: 'updated',
                cell: (info) =>
                    moment(info.getValue() as Date)
                        .local()
                        .format('YYYY-MM-DD HH:mm'),
                header: t('Updated') as string
            }
        ],
        [t]
    );

    const pagination = useMemo(
        () => ({
            pageIndex,
            pageSize
        }),
        [pageIndex, pageSize]
    );

    const table = useReactTable({
        data: data?.decks,
        columns,
        enableFilters: true,
        getCoreRowModel: getCoreRowModel(),
        manualFiltering: true,
        manualPagination: true,
        manualSorting: true,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        pageCount: Math.ceil(data?.totalCount / pageSize) ?? -1,
        state: {
            sorting,
            pagination,
            columnFilters
        }
    });

    let content;

    if (isLoading) {
        content = <LoadingSpinner text='Loading decks, please wait...' />;
    } else if (isError) {
        content = (
            <Alert variant='danger'>
                {t('An error occured loading your decks. Please try again later.')}
            </Alert>
        );
    } else if (!data.success) {
        content = (
            <div>
                <Alert variant='danger'>
                    {t('An error occured loading your decks. Please try again later.')}
                </Alert>
            </div>
        );
    } else if (data.decks.length === 0) {
        content = <Alert variant='info'>{t('You have no decks.')}</Alert>;
    } else {
        content = (
            <div>
                <div className='d-flex justify-content-between mb-3'>
                    <div></div>
                    <div>
                        <FaIconButton variant='light' icon={faRefresh}></FaIconButton>
                    </div>
                </div>
                <div className='table-scroll'>
                    <Table striped variant='dark' bordered>
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            colSpan={header.colSpan}
                                            className='user-select-none'
                                        >
                                            {header.isPlaceholder ? null : (
                                                <>
                                                    <div
                                                        className={`d-flex ${
                                                            header.column.id === 'select'
                                                                ? 'justify-content-center'
                                                                : 'justify-content-between'
                                                        }`}
                                                        {...{
                                                            role: header.column.getCanSort()
                                                                ? 'button'
                                                                : '',
                                                            onClick:
                                                                header.column.getToggleSortingHandler()
                                                        }}
                                                    >
                                                        {flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                        {{
                                                            asc: (
                                                                <div>
                                                                    {' '}
                                                                    <FontAwesomeIcon
                                                                        icon={faArrowUpLong}
                                                                    />
                                                                </div>
                                                            ),
                                                            desc: (
                                                                <div>
                                                                    {' '}
                                                                    <FontAwesomeIcon
                                                                        icon={faArrowDownLong}
                                                                    />
                                                                </div>
                                                            )
                                                        }[header.column.getIsSorted() as string] ??
                                                            null}
                                                    </div>
                                                    {header.column.getCanFilter() && (
                                                        <InputGroup>
                                                            <>
                                                                <InputGroup.Text className='text-dark'>
                                                                    <FontAwesomeIcon
                                                                        icon={faMagnifyingGlass}
                                                                    />
                                                                </InputGroup.Text>
                                                                <DebouncedInput
                                                                    className='bg-light text-dark'
                                                                    value={
                                                                        (header.column.getFilterValue() ??
                                                                            '') as string
                                                                    }
                                                                    onChange={(value) =>
                                                                        header.column.setFilterValue(
                                                                            value
                                                                        )
                                                                    }
                                                                />
                                                                {header.column.getFilterValue() && (
                                                                    <button
                                                                        type='button'
                                                                        className='btn bg-transparent text-danger'
                                                                        style={{
                                                                            marginLeft: '-40px',
                                                                            zIndex: '100'
                                                                        }}
                                                                        onClick={() => {
                                                                            header.column.setFilterValue(
                                                                                ''
                                                                            );
                                                                        }}
                                                                    >
                                                                        <FontAwesomeIcon
                                                                            icon={faTimes}
                                                                        />
                                                                    </button>
                                                                )}
                                                            </>
                                                        </InputGroup>
                                                    )}
                                                </>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map((row) => (
                                <tr key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                        <tfoot></tfoot>
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
                                Page {table.getState().pagination.pageIndex + 1} of{' '}
                                {table.getPageCount()} ({data?.totalCount} items)
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
            </div>
        );
    }

    return (
        <Panel title={t('Decks')}>
            <LinkContainer to='/decks/new'>
                <FaIconButton variant='light' icon={faFileCirclePlus} text='New' />
            </LinkContainer>
            <LinkContainer to='/decks/import'>
                <FaIconButton variant='light' className='ms-2' icon={faDownload} text='Import' />
            </LinkContainer>
            <LinkContainer to='/decks/thronesdb'>
                <Button variant='light' className='ms-2'>
                    <Trans>
                        <span className='pe-2'>ThronesDB</span>
                    </Trans>
                    <span className='icon icon-power'></span>
                </Button>
            </LinkContainer>

            {content}
        </Panel>
    );
};

export default Decks;
