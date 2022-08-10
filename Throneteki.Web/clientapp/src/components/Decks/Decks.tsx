import React, { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Alert, Button, InputGroup, OverlayTrigger, Popover, Table } from 'react-bootstrap';
import {
    faFileCirclePlus,
    faDownload,
    faRefresh,
    faArrowUpLong,
    faArrowDownLong,
    faMagnifyingGlass,
    faTimes,
    faFilter,
    faHeart,
    IconDefinition
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { LinkContainer } from 'react-router-bootstrap';
import {
    getCoreRowModel,
    flexRender,
    useReactTable,
    SortingState,
    ColumnDef,
    PaginationState,
    ColumnFiltersState,
    RowData
} from '@tanstack/react-table';
import moment from 'moment';
import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome';

import Panel from '../../components/Site/Panel';
import FaIconButton from '../Site/FaIconButton';
import { useGetDecksQuery, useGetFilterOptionsForDecksQuery } from '../../redux/api/apiSlice';
import LoadingSpinner from '../LoadingSpinner';
import TablePagination from '../Site/TablePagination';
import DebouncedInput from '../Site/DebouncedInput';
import { Card, Faction } from '../../types/data';
import FactionImage from '../Images/FactionImage';
import CardImage from '../Images/CardImage';
import { useNavigate } from 'react-router-dom';
import { Deck, DeckCard } from '../../types/decks';
import { DrawCardType } from '../../types/enums';
import TableGroupFilter from '../Site/TableGroupFilter';

declare module '@tanstack/table-core' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ColumnMeta<TData extends RowData, TValue> {
        colWidth: number;
        groupingFilter?: JSX.Element;
    }
}

const Decks = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

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
                header: t('Name') as string,
                cell: (info) => {
                    return <Trans>{info.getValue() as string}</Trans>;
                },
                meta: {
                    colWidth: 4
                }
            },
            {
                id: 'faction.name',
                accessorFn: (row) => row.faction,
                cell: (info) => {
                    const faction = info.getValue() as Faction;
                    return (
                        <div className='d-flex justify-content-center'>
                            <FactionImage faction={faction.code} />
                        </div>
                    );
                },
                meta: {
                    colWidth: 1,
                    groupingFilter: (
                        <Popover>
                            <Popover.Body className='text-dark bg-light'>
                                <TableGroupFilter
                                    onOkClick={(filter) => {
                                        if (filter.length > 0) {
                                            table.getColumn('faction.name').setFilterValue(filter);
                                        }
                                    }}
                                    fetchData={useGetFilterOptionsForDecksQuery}
                                    filter={
                                        fetchDataOptions.columnFilters.filter(
                                            (f) => f.id === 'faction.name'
                                        )[0]
                                    }
                                    args={{
                                        column: 'faction.name',
                                        columnFilters: fetchDataOptions.columnFilters
                                    }}
                                />
                            </Popover.Body>
                        </Popover>
                    )
                },
                header: t('Faction') as string
            },
            {
                accessorFn: (row) => row.agenda,
                id: 'agenda.label',
                cell: (info) => {
                    const agenda = info.getValue() as Card;
                    const agendas = [];

                    if (agenda) {
                        agendas.push(agenda.code);
                    }

                    for (const agenda of info.row.original.deckCards.filter(
                        (dc: DeckCard) => dc.type == DrawCardType.Banner
                    )) {
                        agendas.push(agenda.card.code);
                    }

                    const content =
                        agendas.length === 0 ? (
                            <Trans>None</Trans>
                        ) : (
                            agendas.map((agenda: string) => {
                                return <CardImage className='me-1' key={agenda} card={agenda} />;
                            })
                        );

                    return <div className='d-flex'>{content}</div>;
                },
                meta: {
                    colWidth: 2
                },
                header: t('Agenda(s)') as string,
                enableColumnFilter: false,
                enableSorting: false
            },
            {
                accessorKey: 'created',
                cell: (info) =>
                    moment(info.getValue() as Date)
                        .local()
                        .format('YYYY-MM-DD HH:mm'),

                header: t('Created') as string,
                meta: {
                    colWidth: 2
                },
                enableColumnFilter: false
            },
            {
                accessorKey: 'updated',
                cell: (info) =>
                    moment(info.getValue() as Date)
                        .local()
                        .format('YYYY-MM-DD HH:mm'),
                header: t('Updated') as string,
                meta: {
                    colWidth: 2
                },
                enableColumnFilter: false
            },
            {
                accessorKey: 'isFavourite',
                cell: (info) => (
                    <div className='d-flex justify-content-center text-danger'>
                        <>
                            {info.getValue() && <FontAwesomeIcon icon={faHeart} />}
                            {info.getValue() || (
                                <FontAwesomeIcon icon={faHeartRegular as IconDefinition} />
                            )}
                        </>
                    </div>
                ),
                header: t('Favourite') as string,
                meta: {
                    colWidth: 1
                },
                enableColumnFilter: false
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
        content = (
            <Alert variant='info'>
                {t('You have no decks. Use the options above to add some.')}
            </Alert>
        );
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
                    <Table striped variant='dark' bordered hover>
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            colSpan={header.colSpan}
                                            className={`user-select-none align-top col-${
                                                header.column.columnDef.meta?.colWidth || 3
                                            }`}
                                        >
                                            {header.isPlaceholder ? null : (
                                                <>
                                                    <div
                                                        className={`d-flex ${
                                                            header.column.id === 'select'
                                                                ? 'justify-content-center'
                                                                : 'justify-content-between'
                                                        }`}
                                                        {...{}}
                                                    >
                                                        <span
                                                            className='flex-grow-1'
                                                            role={
                                                                header.column.getCanSort()
                                                                    ? 'button'
                                                                    : ''
                                                            }
                                                            onClick={header.column.getToggleSortingHandler()}
                                                        >
                                                            {flexRender(
                                                                header.column.columnDef.header,
                                                                header.getContext()
                                                            )}
                                                        </span>
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
                                                        {header.column.columnDef.meta
                                                            ?.groupingFilter && (
                                                            <>
                                                                <OverlayTrigger
                                                                    trigger='click'
                                                                    placement='right'
                                                                    rootClose={true}
                                                                    overlay={
                                                                        header.column.columnDef.meta
                                                                            ?.groupingFilter
                                                                    }
                                                                >
                                                                    <FontAwesomeIcon
                                                                        icon={faFilter}
                                                                    />
                                                                </OverlayTrigger>
                                                            </>
                                                        )}
                                                    </div>
                                                    {header.column.getCanFilter() &&
                                                        !header.column.columnDef.meta
                                                            ?.groupingFilter && (
                                                            <InputGroup>
                                                                <>
                                                                    <InputGroup.Text className='border-dark bg-dark text-light'>
                                                                        <FontAwesomeIcon
                                                                            icon={faMagnifyingGlass}
                                                                        />
                                                                    </InputGroup.Text>
                                                                    <DebouncedInput
                                                                        className=''
                                                                        value={
                                                                            header.column.getFilterValue() as string
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
                                <tr
                                    key={row.id}
                                    onClick={() => {
                                        navigate(`/decks/${row.original.id}/`);
                                    }}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            className={`col-${
                                                cell.column.columnDef.meta?.colWidth || '1'
                                            }`}
                                        >
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
            <div className='mb-3'>
                <LinkContainer to='/decks/new'>
                    <FaIconButton variant='light' icon={faFileCirclePlus} text='New' />
                </LinkContainer>
                <LinkContainer to='/decks/import'>
                    <FaIconButton
                        variant='light'
                        className='ms-2'
                        icon={faDownload}
                        text='Import'
                    />
                </LinkContainer>
                <LinkContainer to='/decks/thronesdb'>
                    <Button variant='light' className='ms-2'>
                        <Trans>
                            <span className='pe-2'>ThronesDB</span>
                        </Trans>
                        <span className='icon icon-power'></span>
                    </Button>
                </LinkContainer>
            </div>
            {content}
        </Panel>
    );
};

export default Decks;
