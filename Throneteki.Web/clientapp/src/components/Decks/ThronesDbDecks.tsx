import React, { useState, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Alert, Button, Col, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faRefresh,
    faDownload,
    faCloudArrowUp,
    faArrowUpLong,
    faArrowDownLong,
    faCircleCheck
} from '@fortawesome/free-solid-svg-icons';

import {
    ApiError,
    useGetThronesDbDecksQuery,
    useImportThronesDbDecksMutation
} from '../../redux/api/apiSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ThronesDbDeck } from '../../types/decks';
import {
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
    useReactTable,
    SortingState,
    ColumnDef
} from '@tanstack/react-table';
import moment from 'moment';
import TablePagination from '../Site/TablePagination';
import IndeterminateCheckbox from '../Site/InterderminateCheckBox';
import FaIconButton from '../Site/FaIconButton';

const ThronesDbDecks = () => {
    const { t } = useTranslation();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [rowSelection, setRowSelection] = useState({});
    const [error, setError] = useState('');
    const { data, isLoading, isError } = useGetThronesDbDecksQuery({});
    const [importDecks, { isLoading: isImportLoading }] = useImportThronesDbDecksMutation();

    const onImportClick = async (deckIds: number[]) => {
        setError('');

        try {
            const response = await importDecks(deckIds).unwrap();

            if (!response.success) {
                setError(response.message);
            }
        } catch (err) {
            const apiError = err as ApiError;
            setError(
                t(
                    apiError.data.message ||
                        'An error occured importing decks. Please try again later.'
                )
            );
        }
    };

    let content;

    const columns = useMemo<ColumnDef<ThronesDbDeck>[]>(
        () => [
            {
                id: 'select',
                header: ({ table }) => (
                    <label className='text-center'>
                        <IndeterminateCheckbox
                            {...{
                                className: 'mb-1',
                                checked: table.getIsAllRowsSelected(),
                                indeterminate: table.getIsSomeRowsSelected(),
                                onChange: table.getToggleAllRowsSelectedHandler()
                            }}
                        />
                    </label>
                ),
                cell: ({ row }) => (
                    <label className='text-center'>
                        <IndeterminateCheckbox
                            {...{
                                className: 'mt-1',
                                checked: row.getIsSelected(),
                                indeterminate: row.getIsSomeSelected(),
                                onChange: row.getToggleSelectedHandler()
                            }}
                        />
                    </label>
                ),
                enableSorting: false
            },
            {
                accessorKey: 'name',
                header: t('Name') as string
            },
            {
                accessorKey: 'faction_name',
                header: t('Faction') as string
            },
            {
                accessorKey: 'date_creation',
                cell: (info) =>
                    moment(info.getValue() as Date)
                        .local()
                        .format('YYYY-MM-DD HH:mm'),
                header: t('Created') as string
            },
            {
                accessorKey: 'date_update',
                cell: (info) =>
                    moment(info.getValue() as Date)
                        .local()
                        .format('YYYY-MM-DD HH:mm'),
                header: t('Updated') as string
            },
            {
                id: 'is_synced',
                accessorKey: 'is_synced',
                cell: (info) =>
                    info.getValue() ? (
                        <div className='text-center text-primary'>
                            <FontAwesomeIcon icon={faCircleCheck} />
                        </div>
                    ) : null,
                enableSorting: false,
                header: t('Synced') as string
            }
        ],
        [t]
    );

    const table = useReactTable({
        data: data?.decks,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onRowSelectionChange: setRowSelection,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
            rowSelection
        },
        onSortingChange: setSorting
    });

    if (isLoading) {
        content = <LoadingSpinner text='Loading ThronesDB decks, please wait...' />;
    } else if (isImportLoading) {
        content = <LoadingSpinner text='Importing decks, please wait...' />;
    } else if (isError) {
        content = (
            <Alert variant='danger'>
                {t('An error occured loading ThronesDB decks. Please try again later.')}
            </Alert>
        );
    } else if (!data.success) {
        content = (
            <div>
                <Alert variant='danger'>
                    {t('An error occured loading ThronesDB decks. Please try again later.')}
                </Alert>
                <a href='/connect/link-tdb' className='btn btn-primary'>
                    <Trans>Link account</Trans>
                </a>
            </div>
        );
    } else if (data.decks.length === 0) {
        content = (
            <Alert variant='info'>
                {t('There are no decks in your ThronesDB account to import.')}
            </Alert>
        );
    } else {
        content = (
            <div>
                <div className='d-flex justify-content-between mb-3'>
                    <div>
                        <FaIconButton
                            variant='light'
                            disabled={table.getSelectedRowModel().rows.length === 0}
                            icon={faDownload}
                            text='Import Selected'
                            onClick={async () => {
                                await onImportClick(
                                    table.getSelectedRowModel().flatRows.map((r) => r.original.id)
                                );
                            }}
                        />
                        <FaIconButton
                            variant='light'
                            className='ms-2'
                            icon={faCloudArrowUp}
                            text='Import All'
                            onClick={async () => {
                                await onImportClick(data.decks.map((d: ThronesDbDeck) => d.id));
                            }}
                        />
                    </div>
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
                                {table.getPageCount()} ({data.decks.length} items)
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
        <Col>
            {error && <Alert variant='danger'>{t(error)}</Alert>}
            {content}
        </Col>
    );
};

export default ThronesDbDecks;
