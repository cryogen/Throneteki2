import React, { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Popover } from 'react-bootstrap';
import {
    faFileCirclePlus,
    faDownload,
    faRefresh,
    faHeart,
    IconDefinition
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ColumnDef, RowData, Table, ColumnFilter } from '@tanstack/react-table';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Panel from '../../components/Site/Panel';
import FaIconButton from '../Site/FaIconButton';
import {
    useGetDecksQuery,
    useGetFilterOptionsForDecksQuery,
    useToggleDeckFavouriteMutation
} from '../../redux/api/apiSlice';
import { Card, Faction } from '../../types/data';
import FactionImage from '../Images/FactionImage';
import CardImage from '../Images/CardImage';
import { Deck, DeckCard } from '../../types/decks';
import { DrawCardType } from '../../types/enums';
import TableGroupFilter from '../Table/TableGroupFilter';
import ReactTable from '../Table/ReactTable';

declare module '@tanstack/table-core' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ColumnMeta<TData extends RowData, TValue> {
        colWidth: number;
        groupingFilter?: (table: Table<TData>) => JSX.Element;
    }
}

const Decks = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [toggleFavourite, { isLoading: isToggleLoading }] = useToggleDeckFavouriteMutation();

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
                    <div
                        className='d-flex justify-content-center text-danger'
                        role='button'
                        onClick={async (event) => {
                            event.stopPropagation();

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
        [t]
    );

    const content = (
        <div>
            <div className='d-flex justify-content-between mb-3'>
                <div></div>
                <div>
                    <FaIconButton variant='light' icon={faRefresh}></FaIconButton>
                </div>
            </div>
            <ReactTable
                dataLoadFn={useGetDecksQuery}
                defaultSort={{
                    id: 'updated',
                    desc: true
                }}
                columns={columns}
                onRowClick={(row) => navigate(`/decks/${row.original.id}/`)}
            />
        </div>
    );

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
