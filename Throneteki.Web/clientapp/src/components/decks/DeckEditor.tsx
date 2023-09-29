import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import LoadingSpinner from '../LoadingSpinner';
import {
    ApiError,
    useAddDeckMutation,
    useGetCardsQuery,
    useGetFactionsQuery,
    useSaveDeckMutation
} from '../../redux/api/apiSlice';
import { Card, Faction } from '../../types/data';
import { BannersForFaction, Constants } from '../../constants';
import { ColumnDef, RowData } from '@tanstack/react-table';
import { Deck, SaveDeck, SaveDeckCard } from '../../types/decks';
import ReactTable from '../table/ReactTable';
import DeckSummary from './DeckSummary';
import Alert from '../site/Alert';
import { Button, ButtonGroup, Input, extendVariants } from '@nextui-org/react';

declare module '@tanstack/table-core' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ColumnMeta<TData extends RowData, TValue> {
        colWidth: number;
    }
}

interface DeckEditorProps {
    deck: Deck;
    onBackClick: () => void;
}

const SmallButton = extendVariants(Button, {
    variants: {
        size: {
            xs: 'px-unit-2 min-w-unit-8 h-unit-8 text-small gap-unit-1 rounded-none first:rounded-l-md last:rounded-r-md border'
        }
    }
});

const factionToTextColourMap: { [key: string]: string } = {
    baratheon: 'text-baratheon',
    greyjoy: 'text-greyjoy',
    lannister: 'text-lannister',
    martell: 'text-martell',
    neutral: 'text-neutral',
    stark: 'text-startl',
    targaryen: 'text-targaryen',
    thenightswatch: 'text-thenightswatch',
    tyrell: 'text-tyrell'
};

const DeckEditor = ({ deck, onBackClick }: DeckEditorProps) => {
    const { t } = useTranslation();
    const { data: cards, isLoading, isError } = useGetCardsQuery({});
    const [addDeck, { isLoading: isAddLoading }] = useAddDeckMutation();
    const [saveDeck, { isLoading: isSaveLoading }] = useSaveDeckMutation();
    const {
        data: factions,
        isLoading: isFactionsLoading,
        isError: isFactionsError
    } = useGetFactionsQuery({});
    const [factionFilter, setFactionFilter] = useState<string[]>(
        [deck.faction.code]
            .concat(['neutral'])
            .concat(
                deck.deckCards
                    .filter((a) => BannersForFaction[a.card.code])
                    .map((a) => BannersForFaction[a.card.code])
            )
    );
    const [typeFilter, setTypeFilter] = useState<string[]>(['character', 'agenda', 'plot']);
    const [deckCards, setDeckCards] = useState<SaveDeckCard[]>(deck.deckCards);
    const [deckName, setDeckName] = useState<string>(deck.name);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const buildSaveDeck = () => {
        const saveDeck: SaveDeck = {
            id: deck.id,
            name: deckName,
            faction: factionsByCode[deck.faction.code].id,
            agenda: deck.agenda && cardsByCode[deck.agenda.code].id,
            bannerCards: [],
            plotCards: {},
            drawCards: {}
        };

        saveDeck.bannerCards = deckCards
            .filter((dc) => dc.card.type === 'agenda')
            .map((c) => cardsByCode[c.card.code].id);

        for (const deckCard of deckCards.filter(
            (dc) => cardsByCode[dc.card.code].type === 'plot'
        )) {
            saveDeck.plotCards[cardsByCode[deckCard.card.code].id] = deckCard.count;
        }

        for (const deckCard of deckCards.filter(
            (dc) =>
                cardsByCode[dc.card.code].type !== 'plot' &&
                cardsByCode[dc.card.code].type !== 'agenda'
        )) {
            saveDeck.drawCards[cardsByCode[deckCard.card.code].id] = deckCard.count;
        }

        return saveDeck;
    };

    const cardsByCode = useMemo(() => {
        return cards && Object.assign({}, ...cards.map((card: Card) => ({ [card.code]: card })));
    }, [cards]);

    const columns = useMemo<ColumnDef<Card>[]>(
        () => [
            {
                accessorKey: 'label',
                header: t('Name') as string,
                cell: (info) => <Trans>{info.getValue() as string}</Trans>,
                meta: {
                    colWidth: '70%'
                }
            },
            {
                id: 'C/I',
                accessorFn: (row) =>
                    row.income != undefined ? row.income : row.cost != undefined ? row.cost : '',
                header: t('C/I') as string,
                meta: {
                    colWidth: '10%'
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
                    colWidth: '10%'
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
                    colWidth: '10%'
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
                    colWidth: '10%'
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
                        <ButtonGroup className='rounded-md border' radius='md'>
                            {[...Array(max).keys()].map((digit) => (
                                <SmallButton
                                    size='xs'
                                    className='w-1'
                                    key={digit}
                                    value={digit}
                                    color={count === digit ? 'primary' : null}
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
                                </SmallButton>
                            ))}
                        </ButtonGroup>
                    );
                },
                meta: {
                    colWidth: 1
                }
            }
        ],
        [t, deckCards, cardsByCode]
    );

    const factionsByCode = useMemo(() => {
        return (
            factions &&
            Object.assign({}, ...factions.map((faction: Faction) => ({ [faction.code]: faction })))
        );
    }, [factions]);

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

    return (
        <div className='grid grid-cols-2 gap-4'>
            <div>
                <div className='mb-2'>
                    <Button color='default' className='mr-2' onClick={() => onBackClick()}>
                        <Trans>Back</Trans>
                    </Button>
                    <Button
                        color='primary'
                        isLoading={isAddLoading || isSaveLoading}
                        onClick={async () => {
                            setError('');
                            setSuccess('');

                            const deckToSave = buildSaveDeck();

                            try {
                                const response = deckToSave.id
                                    ? await saveDeck(deckToSave).unwrap()
                                    : await addDeck(deckToSave).unwrap();
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
                    </Button>
                </div>
                {error && <Alert variant='danger'>{error}</Alert>}
                {success && <Alert variant='success'>{success}</Alert>}
                <div>
                    <Input
                        placeholder={t('Enter a name')}
                        value={deckName}
                        onChange={(event) => setDeckName(event.target.value)}
                        label={t('Deck Name')}
                    />
                    <div>
                        <ButtonGroup className='mt-3 rounded-md border' radius='md'>
                            {cardTypes.map((type: string) => {
                                return (
                                    <SmallButton
                                        key={type}
                                        size='xs'
                                        color={
                                            typeFilter.some((t) => t === type) ? 'primary' : null
                                        }
                                        onClick={() =>
                                            setTypeFilter(
                                                typeFilter.some((t) => t === type)
                                                    ? typeFilter.filter((t) => t !== type)
                                                    : typeFilter.concat(type)
                                            )
                                        }
                                    >
                                        <span className={`icon icon-${type}`}></span>
                                    </SmallButton>
                                );
                            })}
                        </ButtonGroup>
                    </div>
                    <div>
                        <ButtonGroup
                            className='mb-3 mt-1 rounded-md border'
                            radius='md'
                            aria-label='First group'
                        >
                            {Constants.Factions.concat('neutral').map((faction: string) => {
                                return (
                                    <SmallButton
                                        key={faction}
                                        size='xs'
                                        color={
                                            factionFilter.some((f) => f === faction)
                                                ? 'primary'
                                                : null
                                        }
                                        onClick={() =>
                                            setFactionFilter(
                                                factionFilter.some((f) => f === faction)
                                                    ? factionFilter.filter((f) => f !== faction)
                                                    : factionFilter.concat(faction)
                                            )
                                        }
                                    >
                                        <span
                                            className={`icon icon-${faction} ${factionToTextColourMap[faction]}`}
                                        ></span>
                                    </SmallButton>
                                );
                            })}
                        </ButtonGroup>
                    </div>
                    <div className='h-[60vh]'>
                        <ReactTable
                            dataLoadFn={() => ({
                                data: { data: cards },
                                isLoading: false,
                                isError: false
                            })}
                            defaultColumnFilters={{ type: typeFilter, faction: factionFilter }}
                            defaultSort={{
                                column: 'type',
                                direction: 'descending'
                            }}
                            disableSelection
                            columns={columns}
                        />
                    </div>
                </div>
            </div>
            <div>
                <DeckSummary
                    deck={{
                        name: deckName,
                        deckCards: deckCards,
                        faction: factionsByCode[deck.faction.code]
                    }}
                />
            </div>
        </div>
    );
};

export default DeckEditor;
