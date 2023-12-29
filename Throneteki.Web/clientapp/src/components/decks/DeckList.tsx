import { useMemo, useState } from 'react';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import {
    faDownload,
    faFileCirclePlus,
    faHeart,
    faTrashAlt
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ColumnDef, RowData, Table } from '@tanstack/react-table';
import moment from 'moment';
import { useTranslation, Trans } from 'react-i18next';

import {
    useGetFilterOptionsForDecksQuery,
    useGetDecksQuery,
    useToggleDeckFavouriteMutation,
    useDeleteDecksMutation
} from '../../redux/api/apiSlice';
import { Card, Faction } from '../../types/data';
import { Deck, DeckCard } from '../../types/decks';
import { DrawCardType } from '../../types/enums';
import CardImage from '../images/CardImage';
import FactionImage from '../images/FactionImage';
import ReactTable, { TableButton } from '../table/ReactTable';
import DeckStatusLabel from './DeckStatusLabel';
import { Constants } from '../../constants';
import TableGroupFilter from '../table/TableGroupFilter';

import './DeckList.css';
import { useNavigate } from 'react-router-dom';
import { toastr } from 'react-redux-toastr';

declare module '@tanstack/table-core' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ColumnMeta<TData extends RowData, TValue> {
        colWidth: number | `${number}` | `${number}%`;
        groupingFilter?: (table: Table<TData>, onToggle: () => void) => JSX.Element;
    }
}

interface DeckListProps {
    onDeckSelected: (deck: Deck) => void;
    readOnly?: boolean;
    restrictedList?: string;
}

const DeckList = ({ onDeckSelected, readOnly = false, restrictedList }: DeckListProps) => {
    const { t } = useTranslation();
    const [toggleFavourite] = useToggleDeckFavouriteMutation();
    const [deleteDecks, { isLoading: isDeleteLoading }] = useDeleteDecksMutation();
    const [mousePos, setMousePosition] = useState({ x: 0, y: 0 });
    const [zoomCard, setZoomCard] = useState(null);
    const navigate = useNavigate();
    const [selectedIds, setSelectedIds] = useState([]);

    const columns = useMemo<ColumnDef<Deck>[]>(
        () => [
            {
                accessorKey: 'name',
                header: t('Name') as string,
                cell: (info) => {
                    return <Trans>{info.getValue() as string}</Trans>;
                },
                meta: {
                    colWidth: '35%'
                }
            },
            {
                id: 'faction.name',
                accessorFn: (row) => row.faction,
                cell: (info) => {
                    const faction = info.getValue() as Faction;
                    return (
                        <div className='flex content-center'>
                            <FactionImage
                                faction={faction.code}
                                onMouseOver={() =>
                                    setZoomCard(Constants.FactionsImagePaths[faction.code])
                                }
                                onMouseMove={(event) => {
                                    let y = event.clientY;
                                    const yPlusHeight = y + 420;

                                    if (yPlusHeight >= window.innerHeight) {
                                        y -= yPlusHeight - window.innerHeight;
                                    }

                                    setMousePosition({ x: event.clientX, y: y });
                                }}
                                onMouseOut={() => setZoomCard(null)}
                            />
                        </div>
                    );
                },
                meta: {
                    colWidth: '10%',
                    groupingFilter: (table: Table<Deck>, onToggle: () => void) => {
                        return (
                            <TableGroupFilter
                                onOkClick={(filter) => {
                                    if (filter.length > 0) {
                                        table.getColumn('faction.name').setFilterValue(filter);
                                    }

                                    onToggle();
                                }}
                                onCancelClick={() => onToggle()}
                                fetchData={useGetFilterOptionsForDecksQuery}
                                filter={
                                    table.getColumn('faction.name').getFilterValue() as string[]
                                }
                                args={{
                                    column: 'faction.name',
                                    columnFilters: table.getColumn('faction.name').getFilterValue()
                                }}
                            />
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
                                    <span
                                        key={agenda}
                                        onMouseOver={() => setZoomCard(`/img/cards/${agenda}.png`)}
                                        onMouseMove={(event) => {
                                            let y = event.clientY;
                                            const yPlusHeight = y + 420;

                                            if (yPlusHeight >= window.innerHeight) {
                                                y -= yPlusHeight - window.innerHeight;
                                            }

                                            setMousePosition({ x: event.clientX, y: y });
                                        }}
                                        onMouseOut={() => setZoomCard(null)}
                                    >
                                        <CardImage
                                            className='mr-1'
                                            imageUrl={`/img/cards/${agenda}.png`}
                                        />
                                    </span>
                                );
                            })
                        );

                    return <div className='flex'>{content}</div>;
                },
                meta: {
                    colWidth: '10%'
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
                        .format('YYYY-MM-DD'),

                header: t('Created') as string,
                meta: {
                    colWidth: '15%'
                },
                enableColumnFilter: false
            },
            {
                accessorKey: 'updated',
                cell: (info) =>
                    moment(info.getValue() as Date)
                        .local()
                        .format('YYYY-MM-DD'),
                header: t('Updated') as string,
                meta: {
                    colWidth: '15%'
                },
                enableColumnFilter: false
            },
            {
                accessorKey: 'status',
                cell: (info) => (
                    <div className='justify-content-center flex'>
                        <DeckStatusLabel status={info.row.original.status} />
                    </div>
                ),
                header: t('Validity') as string,
                meta: {
                    colWidth: '10%'
                },
                enableColumnFilter: false,
                enableSorting: false
            },
            {
                accessorKey: 'winRate',
                cell: (info) => {
                    return (
                        <span>
                            {info.getValue() as string}
                            {`${info.getValue() ? '%' : ''}`}
                        </span>
                    );
                },
                header: t('Win Rate') as string,
                meta: {
                    colWidth: '10%'
                },
                enableColumnFilter: false
            },
            {
                accessorKey: 'isFavourite',
                cell: (info) => (
                    <div
                        className='justify-content-center flex text-danger'
                        role={readOnly ? 'false' : 'button'}
                        onClick={async (event) => {
                            event.stopPropagation();

                            if (readOnly) {
                                return;
                            }

                            await toggleFavourite(info.row.original.id);
                        }}
                    >
                        <FontAwesomeIcon
                            icon={info.getValue() ? faHeart : (faHeartRegular as IconDefinition)}
                        />
                    </div>
                ),
                header: t('Favourite') as string,
                meta: {
                    colWidth: '10%'
                },
                enableColumnFilter: false
            }
        ],
        [t, readOnly, toggleFavourite]
    );

    const buttons: TableButton[] = readOnly
        ? []
        : [
              {
                  color: 'default',
                  icon: <FontAwesomeIcon icon={faFileCirclePlus} />,
                  label: t('New'),
                  onClick: () => navigate('/decks/new')
              },
              {
                  color: 'default',
                  icon: <FontAwesomeIcon icon={faDownload} />,
                  label: t('Import'),
                  onClick: () => navigate('/decks/import')
              },
              {
                  color: 'danger',
                  icon: <FontAwesomeIcon icon={faTrashAlt} />,
                  label: t('Delete'),
                  disabled: selectedIds.length === 0,
                  isLoading: isDeleteLoading,
                  onClick: () => {
                      toastr.confirm(
                          t(
                              `Are you sure you want to delete ${
                                  selectedIds.length === 1 ? 'this deck' : 'these decks'
                              }?`
                          ),
                          {
                              okText: t('Yes'),
                              cancelText: t('Cancel'),
                              onOk: async () => {
                                  try {
                                      const response = await deleteDecks(selectedIds).unwrap();

                                      if (!response.success) {
                                          //    setError(response.message);
                                      } else {
                                          //   setSuccess(t('Deck added successfully.'));
                                      }
                                  } catch (err) {
                                      //   const apiError = err as ApiError;
                                      /* setError(
                                    t(
                                        apiError.data.message ||
                                            'An error occured adding the deck. Please try again later.'
                                    )
                                );*/
                                  }
                              }
                          }
                      );
                  }
              },
              {
                  color: 'default',
                  label: t('ThronesDB'),
                  icon: <span className='icon icon-power'></span>,
                  onClick: () => navigate('/decks/thronesdb')
              }
          ];

    return (
        <div className='h-[75vh]'>
            <ReactTable
                buttons={buttons}
                dataLoadFn={useGetDecksQuery}
                dataLoadArg={restrictedList ? { restrictedList: restrictedList } : null}
                defaultSort={{
                    column: 'updated',
                    direction: 'descending'
                }}
                remote
                disableSelection={readOnly}
                columns={columns}
                onRowClick={(row) => onDeckSelected && onDeckSelected(row.original)}
                onRowSelectionChange={(ids) => setSelectedIds(ids.map((r) => r.original.id))}
            />
            {zoomCard && (
                <div
                    className='decklist-card-zoom fixed left-0 top-0 z-50'
                    style={{ left: mousePos.x + 5 + 'px', top: mousePos.y + 'px' }}
                >
                    <CardImage imageUrl={zoomCard} size='lg' />
                </div>
            )}
        </div>
    );
};

export default DeckList;
