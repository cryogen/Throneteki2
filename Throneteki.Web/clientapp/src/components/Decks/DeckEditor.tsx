import React, { useEffect, useMemo, useState } from 'react';
import {
    Row,
    Col,
    Alert,
    ButtonGroup,
    ButtonToolbar,
    ToggleButton,
    Table,
    Button,
    Form,
    InputGroup
} from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import LoadingSpinner from '../LoadingSpinner';
import {
    ApiError,
    useAddDeckMutation,
    useGetCardsQuery,
    useGetFactionsQuery
} from '../../redux/api/apiSlice';
import { Card, Faction } from '../../types/data';
import { Constants } from '../../constants';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    RowData,
    SortingState,
    useReactTable
} from '@tanstack/react-table';
import { SaveDeck, SaveDeckCard } from '../../types/decks';
import TablePagination from '../Site/TablePagination';
import {
    faArrowUpLong,
    faArrowDownLong,
    faMagnifyingGlass,
    faTimes,
    faCircleNotch
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DebouncedInput from '../Site/DebouncedInput';

declare module '@tanstack/table-core' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ColumnMeta<TData extends RowData, TValue> {
        colWidth: number;
    }
}

interface DeckEditorProps {
    deck: { faction: string; agendas: string[] };
    onBackClick: () => void;
}

const bannersToFaction: Record<string, string> = {
    '01198': 'baratheon',
    '01199': 'greyjoy',
    '01200': 'lannister',
    '01201': 'martell',
    '01202': 'thenightswatch',
    '01203': 'stark',
    '01204': 'targaryen',
    '01205': 'tyrell'
};

const DeckEditor = ({ deck, onBackClick }: DeckEditorProps) => {
    const { t } = useTranslation();
    const { data: cards, isLoading, isError } = useGetCardsQuery({});
    const [addDeck, { isLoading: isAddLoading }] = useAddDeckMutation();
    const {
        data: factions,
        isLoading: isFactionsLoading,
        isError: isFactionsError
    } = useGetFactionsQuery({});
    const [factionFilter, setFactionFilter] = useState<string[]>(
        [deck.faction]
            .concat(['neutral'])
            .concat(deck.agendas.filter((a) => bannersToFaction[a]).map((a) => bannersToFaction[a]))
    );
    const [typeFilter, setTypeFilter] = useState<string[]>(['character', 'agenda', 'plot']);
    const [deckCards, setDeckCards] = useState<SaveDeckCard[]>([]);
    const [deckName, setDeckName] = useState<string>('');
    const [sorting, setSorting] = React.useState<SortingState>([
        {
            id: 'type',
            desc: true
        }
    ]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const columns = useMemo<ColumnDef<Card>[]>(
        () => [
            {
                accessorKey: 'label',
                header: t('Name') as string,
                cell: (info) => <Trans>{info.getValue() as string}</Trans>,
                meta: {
                    colWidth: 7
                }
            },
            {
                id: 'C/I',
                accessorFn: (row) =>
                    row.income != undefined ? row.income : row.cost != undefined ? row.cost : '',
                header: t('C/I') as string,
                meta: {
                    colWidth: 1
                },
                enableColumnFilter: false
            },
            {
                id: 'S/I',
                accessorFn: (row) =>
                    row.initiative != undefined
                        ? row.initiative
                        : row.strength != undefined
                        ? row.strength
                        : '',
                header: t('S/I') as string,
                meta: {
                    colWidth: 1
                },
                enableColumnFilter: false
            },
            {
                accessorKey: 'type',
                header: t('T') as string,
                cell: (info) => (
                    <span
                        className={`icon icon-${info.getValue()} text-${
                            info.row.original.faction.code
                        }`}
                    ></span>
                ),
                filterFn: 'arrIncludesSome',
                meta: {
                    colWidth: 1
                },
                enableColumnFilter: false
            },
            {
                id: 'faction',
                accessorKey: 'faction.code',
                header: t('F') as string,
                cell: (info) => (
                    <span className={`icon icon-${info.getValue()} text-${info.getValue()}`}></span>
                ),
                filterFn: 'arrIncludesSome',
                meta: {
                    colWidth: 1
                },
                enableColumnFilter: false
            },
            {
                id: 'quantity',
                header: t('Quantity') as string,
                cell: (info) => {
                    const max = info.row.original.deckLimit + 1;
                    const deckCard = deckCards.find(
                        (dc) => dc.card.code === info.row.original.code
                    );
                    const count = deckCard?.count || 0;

                    return (
                        <ButtonToolbar>
                            <ButtonGroup>
                                {[...Array(max).keys()].map((digit) => (
                                    <ToggleButton
                                        size='sm'
                                        key={digit}
                                        type='checkbox'
                                        variant='outline-light'
                                        value={digit}
                                        checked={count === digit}
                                        onClick={() => {
                                            let deckCard = deckCards.find(
                                                (dc) => dc.card.code === info.row.original.code
                                            );

                                            if (!deckCard) {
                                                deckCard = {
                                                    card: cardsByCode[info.row.original.code],
                                                    count: digit
                                                };

                                                deckCards.push(deckCard);
                                            }

                                            deckCard.count = digit;

                                            const newDeckCards = [
                                                ...deckCards.filter((dc) => dc.count > 0)
                                            ];

                                            setDeckCards(newDeckCards);
                                        }}
                                    >
                                        {digit}
                                    </ToggleButton>
                                ))}
                            </ButtonGroup>
                        </ButtonToolbar>
                    );
                },
                meta: {
                    colWidth: 1
                }
            }
        ],
        [t]
    );

    const table = useReactTable({
        data: cards,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting
        }
    });

    const cardsByCode = useMemo(() => {
        return cards && Object.assign({}, ...cards.map((card: Card) => ({ [card.code]: card })));
    }, [cards]);

    const factionsByCode = useMemo(() => {
        return (
            factions &&
            Object.assign({}, ...factions.map((faction: Faction) => ({ [faction.code]: faction })))
        );
    }, [factions]);

    useEffect(() => {
        setDeckCards(deck.agendas.map((a) => ({ card: cardsByCode[a], count: 1 })));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cardsByCode]);

    useEffect(() => {
        table.getColumn('type').setFilterValue(typeFilter);
        table.getColumn('faction').setFilterValue(factionFilter);
    }, [table, typeFilter, factionFilter, cardsByCode, deck]);

    if (isLoading || isFactionsLoading) {
        return <LoadingSpinner text={t('Loading, please wait...')} />;
    } else if (isError || isFactionsError) {
        return (
            <Alert variant='danger'>
                <Trans>
                    An error occurred loading data from the server. Please try again later.
                </Trans>
            </Alert>
        );
    }

    let cardTypes = cards.filter((c: Card) => c.type !== 'title').map((card: Card) => card.type);
    cardTypes = Array.from(new Set(cardTypes));

    const groupedCards: Record<string, SaveDeckCard[]> = {};

    for (const deckCard of deckCards) {
        const type = deckCard.card.type;
        if (!groupedCards[type]) {
            groupedCards[type] = [deckCard];
        } else {
            groupedCards[type].push(deckCard);
        }
    }

    const splitCards = [[], [], []];
    let cardIndex = 0;
    let currentContainer: JSX.Element[] = splitCards[0];
    for (const [type, cards] of Object.entries(groupedCards)) {
        currentContainer.push(
            <div className='mt-2 mb-2' key={type}>
                <span className={`me-1 icon icon-${type}`}></span>
                <strong>
                    {type[0].toUpperCase() + type.slice(1)} ({cards.length})
                </strong>
            </div>
        );
        for (const deckCard of cards) {
            currentContainer.push(
                <React.Fragment key={deckCard.card.code}>
                    <div>
                        {deckCard.count}x{' '}
                        <span
                            className={`me-1 icon icon-${type} text-${deckCard.card.faction.code}`}
                        ></span>
                        {deckCard.card.label}
                    </div>
                </React.Fragment>
            );
            cardIndex++;

            if (cardIndex > 40) {
                currentContainer = splitCards[2];
            } else if (cardIndex > 20) {
                currentContainer = splitCards[1];
            }
        }
    }

    return (
        <Row>
            <Col sm={6}>
                <div className='mb-2'>
                    <Button variant='light' className='me-2' onClick={() => onBackClick()}>
                        <Trans>Back</Trans>
                    </Button>
                    <Button
                        variant='primary'
                        disabled={isAddLoading}
                        onClick={async () => {
                            const saveDeck: SaveDeck = {
                                name: deckName,
                                faction: factionsByCode[deck.faction].id,
                                agenda: deck.agendas && cardsByCode[deck.agendas[0]].id,
                                bannerCards: [],
                                plotCards: {},
                                drawCards: {}
                            };

                            setError('');
                            setSuccess('');

                            for (const deckCard of deckCards.filter(
                                (dc) => dc.card.type === 'plot'
                            )) {
                                saveDeck.plotCards[deckCard.card.id] = deckCard.count;
                            }

                            for (const deckCard of deckCards.filter(
                                (dc) => dc.card.type !== 'plot'
                            )) {
                                saveDeck.drawCards[deckCard.card.id] = deckCard.count;
                            }

                            try {
                                const response = await addDeck(saveDeck).unwrap();
                                if (!response.success) {
                                    setError(response.message);
                                } else {
                                    setSuccess(t('Deck added successfully.'));
                                }
                            } catch (err) {
                                const apiError = err as ApiError;
                                setError(
                                    t(
                                        apiError.data.message ||
                                            'An error occured adding the deck. Please try again later.'
                                    )
                                );
                            }
                        }}
                    >
                        <Trans>Save</Trans>
                        {isAddLoading && <FontAwesomeIcon icon={faCircleNotch} spin />}
                    </Button>
                </div>
                {error && <Alert variant='danger'>{error}</Alert>}
                {success && <Alert variant='success'>{success}</Alert>}
                <Form.Group as={Row}>
                    <Form.Label>
                        <Trans>Deck Name</Trans>
                    </Form.Label>
                    <Col>
                        <Form.Control
                            placeholder={t('Enter a name')}
                            value={deckName}
                            onChange={(event) => setDeckName(event.target.value)}
                        />
                    </Col>
                </Form.Group>
                <ButtonToolbar className='mt-3'>
                    <ButtonGroup>
                        {cardTypes.map((type: string) => {
                            return (
                                <ToggleButton
                                    key={type}
                                    type='checkbox'
                                    variant='outline-light'
                                    checked={typeFilter.some((t) => t === type)}
                                    value={type}
                                    onClick={() =>
                                        setTypeFilter(
                                            typeFilter.some((t) => t === type)
                                                ? typeFilter.filter((t) => t !== type)
                                                : typeFilter.concat(type)
                                        )
                                    }
                                >
                                    <span className={`icon icon-${type}`}></span>
                                </ToggleButton>
                            );
                        })}
                    </ButtonGroup>
                </ButtonToolbar>
                <ButtonToolbar className='mt-1'>
                    <ButtonGroup aria-label='First group'>
                        {Constants.Factions.concat('neutral').map((faction: string) => {
                            return (
                                <ToggleButton
                                    key={faction}
                                    type='checkbox'
                                    variant='outline-light'
                                    checked={factionFilter.some((f) => f === faction)}
                                    value={faction}
                                    onClick={() =>
                                        setFactionFilter(
                                            factionFilter.some((f) => f === faction)
                                                ? factionFilter.filter((f) => f !== faction)
                                                : factionFilter.concat(faction)
                                        )
                                    }
                                >
                                    <span className={`icon icon-${faction} text-${faction}`}></span>
                                </ToggleButton>
                            );
                        })}
                    </ButtonGroup>
                </ButtonToolbar>
                <div className='table-scroll mt-2' style={{ height: '49vh' }}>
                    <Table variant='dark' striped hover>
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
                                                    </div>
                                                    {header.column.getCanFilter() && (
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
                                <tr key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            className={`pt-1 pb-1 col-${
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
                                {table.getPageCount()}
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
            </Col>
            <Col sm={6}>
                <Row className='mt-3'>
                    <Col sm={4}>{splitCards[0]}</Col>
                    <Col sm={4}>{splitCards[1]}</Col>
                    <Col sm={4}>{splitCards[2]}</Col>
                </Row>
            </Col>
        </Row>
    );
};

export default DeckEditor;
