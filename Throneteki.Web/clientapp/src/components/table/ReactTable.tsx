import { ForwardedRef, PropsWithChildren, forwardRef, useEffect, useMemo, useState } from 'react';
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
    RowSelectionState,
    ColumnSort
} from '@tanstack/react-table';
import { Trans, useTranslation } from 'react-i18next';

import TablePagination from './TablePagination';
import LoadingSpinner from '../LoadingSpinner';
import { faFilter, faRefresh } from '@fortawesome/free-solid-svg-icons';
import FaIconButton from '../site/FaIconButton';
import {
    Button,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Select,
    SelectItem,
    Selection,
    SortDescriptor,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow
} from '@nextui-org/react';
import Alert, { AlertType } from '../site/Alert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ColorType } from '../../types/ui';

interface DataLoadOptions {
    columnFilters: ColumnFilter[];
    pageIndex: number;
    pageSize: number;
    sorting: SortingState;
}

export interface TableButton {
    label: string;
    icon?: JSX.Element;
    onClick?: () => void;
    color: ColorType;
    disabled?: boolean;
    isLoading?: boolean;
}

interface ReactTableProps<T> {
    buttons?: TableButton[];
    columns: ColumnDef<T>[];
    defaultColumnFilters?: Record<string, string[]>;
    defaultSort?: SortDescriptor;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLoadFn: (options: DataLoadOptions | unknown) => any;
    dataLoadArg?: unknown;
    dataProperty?: string;
    disableSelection?: boolean;
    onRowClick?: (row: Row<T>) => void;
    onRowSelectionChange?: (rows: Row<T>[]) => void;
    remote?: boolean;
}

const TableWrapper = forwardRef(
    ({ children }: PropsWithChildren, ref: ForwardedRef<HTMLTableElement>) => {
        return (
            <div className='h-full overflow-y-auto'>
                <table ref={ref}>{children}</table>
            </div>
        );
    }
);

function ReactTable<T>({
    buttons = [],
    columns,
    dataLoadFn,
    dataLoadArg = null,
    dataProperty = 'data',
    defaultColumnFilters = {},
    defaultSort,
    disableSelection = false,
    onRowClick,
    onRowSelectionChange,
    remote = false
}: ReactTableProps<T>): JSX.Element {
    const { t } = useTranslation();

    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10
    });
    const [sorting, setSorting] = useState<SortDescriptor>(defaultSort);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const pagination = useMemo(
        () => ({
            pageIndex,
            pageSize
        }),
        [pageIndex, pageSize]
    );
    const [rowSelection, setRowSelection] = useState<Selection>(new Set([]));
    const [autoSorting, setAutoSorting] = useState<ColumnSort[]>([]);
    const [isFilterPopOverOpen, setFilterPopOverOpen] = useState<{ [key: string]: boolean }>({});

    const fetchDataOptions = {
        columnFilters,
        pageIndex,
        pageSize,
        sorting: sorting
            ? [{ id: sorting.column.toString(), desc: sorting.direction === 'descending' }]
            : []
    };

    const {
        data: response,
        isLoading,
        isError,
        refetch
    } = dataLoadFn(dataLoadArg ? Object.assign(fetchDataOptions, dataLoadArg) : fetchDataOptions);

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
            onColumnFiltersChange: setColumnFilters,
            pageCount: Math.ceil(response?.totalCount / pageSize) ?? -1,
            state: {
                sorting: sorting
                    ? [{ id: sorting.column.toString(), desc: sorting.direction === 'descending' }]
                    : [],
                pagination: pagination,
                columnFilters: columnFilters,
                rowSelection: [...rowSelection].reduce((keys: RowSelectionState, v) => {
                    keys[v] = true;
                    return keys;
                }, {})
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
            onSortingChange: setAutoSorting,
            state: {
                rowSelection: [...rowSelection].reduce((keys: RowSelectionState, v) => {
                    keys[v] = true;
                    return keys;
                }, {}),
                sorting: autoSorting
            }
        };
    }

    const table = useReactTable(tableOptions);

    const topContent = (
        <div className='flex justify-between'>
            <div className='flex'>
                {buttons.map((b) => (
                    <Button
                        className='mr-2'
                        key={b.label}
                        color={b.color}
                        endContent={b.icon}
                        onClick={b.onClick}
                        isDisabled={b.disabled}
                        isLoading={b.isLoading}
                    >
                        {b.label}
                    </Button>
                ))}
            </div>
            {refetch && (
                <FaIconButton
                    color='default'
                    icon={faRefresh}
                    onClick={() => refetch()}
                ></FaIconButton>
            )}
        </div>
    );

    useEffect(() => {
        for (const [columnId, filter] of Object.entries(defaultColumnFilters)) {
            table.getColumn(columnId)?.setFilterValue(filter);
        }
    }, [defaultColumnFilters, table]);

    useEffect(() => {
        if (rowSelection === 'all' || rowSelection.size > 0) {
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
        return <Alert variant={AlertType.Info}>{t('There is no data to display.')}</Alert>;
    }

    const currPage = table.getState().pagination.pageIndex + 1;
    const pageCount = table.getPageCount();
    const totalCount = remote ? response?.totalCount : response[dataProperty]?.length || 0;

    const tableFooter = (
        <div className='mt-3 flex justify-between'>
            <div className='flex justify-center'>
                <Select
                    className='mr-2 w-20'
                    labelPlacement='outside'
                    onChange={(e) => {
                        table.setPageSize(parseInt(e.target.value));
                    }}
                    disallowEmptySelection
                    selectedKeys={new Set([table.getState().pagination.pageSize.toString()])}
                >
                    {[10, 25, 50].map((pageSize) => (
                        <SelectItem key={pageSize.toString()} value={pageSize}>
                            {t(pageSize.toString())}
                        </SelectItem>
                    ))}
                </Select>
                <TablePagination
                    currentPage={table.getState().pagination.pageIndex + 1}
                    pageCount={table.getPageCount()}
                    setCurrentPage={(page) => table.setPageIndex(page - 1)}
                />
            </div>
            <div className='flex items-center'>
                <span className='mr-1'>
                    <Trans>
                        Page {{ currPage }} of {{ pageCount }} (
                        {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            { totalCount } as any
                        }{' '}
                        items)
                    </Trans>
                </span>
            </div>
        </div>
    );

    return (
        <>
            <Table
                isStriped
                isHeaderSticky
                showSelectionCheckboxes
                selectionMode={disableSelection ? 'none' : 'multiple'}
                selectedKeys={rowSelection}
                onSelectionChange={setRowSelection}
                sortDescriptor={sorting}
                onSortChange={setSorting}
                topContent={topContent}
                bottomContent={tableFooter}
                removeWrapper
                classNames={{ base: 'h-full' }}
                as={TableWrapper}
            >
                <TableHeader>
                    {table.getHeaderGroups()[0].headers.map((header) =>
                        header.isPlaceholder ? null : (
                            <TableColumn
                                key={header.id}
                                width={header.column.columnDef.meta?.colWidth}
                                allowsSorting={header.column.columnDef.enableSorting !== false}
                            >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                {header.column.columnDef.meta?.groupingFilter && (
                                    <>
                                        <Popover
                                            placement='right'
                                            isOpen={isFilterPopOverOpen[header.id]}
                                            onOpenChange={(open) => {
                                                isFilterPopOverOpen[header.id] = open;

                                                const newState = Object.assign(
                                                    {},
                                                    isFilterPopOverOpen
                                                );

                                                setFilterPopOverOpen(newState);
                                            }}
                                        >
                                            <PopoverTrigger>
                                                <FontAwesomeIcon className='ml-1' icon={faFilter} />
                                            </PopoverTrigger>
                                            <PopoverContent>
                                                {header.column.columnDef.meta?.groupingFilter(
                                                    header.getContext().table,
                                                    () => {
                                                        isFilterPopOverOpen[header.id] =
                                                            !isFilterPopOverOpen[header.id];

                                                        const newState = Object.assign(
                                                            {},
                                                            isFilterPopOverOpen
                                                        );

                                                        setFilterPopOverOpen(newState);
                                                    }
                                                )}
                                            </PopoverContent>
                                        </Popover>
                                    </>
                                )}
                            </TableColumn>
                        )
                    )}
                </TableHeader>
                <TableBody
                    isLoading={isLoading}
                    loadingContent={<LoadingSpinner text='Loading data, please wait...' />}
                >
                    {table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id} onClick={() => onRowClick && onRowClick(row)}>
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                    <div>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </div>
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    );
}

export default ReactTable;
