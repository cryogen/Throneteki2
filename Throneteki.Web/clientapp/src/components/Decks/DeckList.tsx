import React, { useMemo } from 'react';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ColumnDef, ColumnFilter, RowData, Table } from '@tanstack/react-table';
import moment from 'moment';
import { Popover } from 'react-bootstrap';
import { useTranslation, Trans } from 'react-i18next';

import {
    useGetFilterOptionsForDecksQuery,
    useGetDecksQuery,
    useToggleDeckFavouriteMutation
} from '../../redux/api/apiSlice';
import { Card, Faction } from '../../types/data';
import { Deck, DeckCard } from '../../types/decks';
import { DrawCardType } from '../../types/enums';
import CardImage from '../Images/CardImage';
import FactionImage from '../Images/FactionImage';
import ReactTable from '../Table/ReactTable';
import TableGroupFilter from '../Table/TableGroupFilter';
import DeckStatusLabel from './DeckStatusLabel';
import IndeterminateCheckbox from '../Table/InterderminateCheckBox';

declare module '@tanstack/table-core' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ColumnMeta<TData extends RowData, TValue> {
        colWidth: number;
        groupingFilter?: (table: Table<TData>) => JSX.Element;
    }
}

interface DeckListProps {
    onDeckSelected: (deck: Deck) => void;
    onDeckSelectionChange?: (selectedIds: number[]) => void;
    readOnly?: boolean;
}

const DeckList = ({ onDeckSelected, onDeckSelectionChange, readOnly = false }: DeckListProps) => {
    const { t } = useTranslation();
    const [toggleFavourite] = useToggleDeckFavouriteMutation();

    const columns = useMemo<ColumnDef<Deck>[]>(
        () => [
            {
                id: 'select',
                header: ({ table }) => (
                    <IndeterminateCheckbox
                        {...{
                            className: 'mb-1',
                            checked: table.getIsAllRowsSelected(),
                            indeterminate: table.getIsSomeRowsSelected(),
                            onChange: table.getToggleAllRowsSelectedHandler()
                        }}
                    />
                ),
                cell: ({ row }) => (
                    <label className='text-center' onClick={(event) => event.stopPropagation()}>
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
                enableSorting: false,
                meta: {
                    colWidth: 1
                }
            },
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
                    groupingFilter: (table: Table<Deck>) => {
                        return (
                            <Popover>
                                <Popover.Body className='text-dark bg-light'>
                                    <TableGroupFilter
                                        onOkClick={(filter) => {
                                            if (filter.length > 0) {
                                                table
                                                    .getColumn('faction.name')
                                                    .setFilterValue(filter);
                                            }
                                        }}
                                        fetchData={useGetFilterOptionsForDecksQuery}
                                        filter={
                                            table
                                                .getColumn('faction.name')
                                                .getFilterValue() as ColumnFilter
                                        }
                                        args={{
                                            column: 'faction.name',
                                            columnFilters: table
                                                .getColumn('faction.name')
                                                .getFilterValue()
                                        }}
                                    />
                                </Popover.Body>
                            </Popover>
                        );
                    }
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
                                return (
                                    <CardImage
                                        className='me-1'
                                        key={agenda}
                                        imageUrl={`/img/cards/${agenda}.png`}
                                    />
                                );
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
                accessorKey: 'status',
                cell: (info) => (
                    <div className='d-flex justify-content-center'>
                        <DeckStatusLabel status={info.row.original.status} />
                    </div>
                ),
                header: t('Validity') as string,
                enableColumnFilter: false
            },
            {
                accessorKey: 'isFavourite',
                cell: (info) => (
                    <div
                        className='d-flex justify-content-center text-danger'
                        role={readOnly ? 'false' : 'button'}
                        onClick={async (event) => {
                            event.stopPropagation();

                            if (readOnly) {
                                return;
                            }

                            await toggleFavourite(info.row.original.id);
                        }}
                    >
                        <>
                            {
                                <FontAwesomeIcon
                                    icon={
                                        info.getValue()
                                            ? faHeart
                                            : (faHeartRegular as IconDefinition)
                                    }
                                />
                            }
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
        [t, readOnly, toggleFavourite]
    );

    return (
        <div>
            <ReactTable
                dataLoadFn={useGetDecksQuery}
                defaultSort={{
                    id: 'updated',
                    desc: true
                }}
                remote
                columns={columns}
                onRowClick={(row) => onDeckSelected && onDeckSelected(row.original)}
                onRowSelectionChange={(rows) =>
                    onDeckSelectionChange && onDeckSelectionChange(rows.map((r) => r.original.id))
                }
            />
        </div>
    );
};

export default DeckList;
