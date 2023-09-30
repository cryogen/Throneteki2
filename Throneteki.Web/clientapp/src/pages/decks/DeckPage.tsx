import { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { faPenToSquare, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

import Panel from '../../components/site/Panel';
import {
    useDeleteDeckMutation,
    useGetCardsQuery,
    useGetDeckQuery,
    useGetRestrictedListQuery
} from '../../redux/api/apiSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import FactionImage from '../../components/images/FactionImage';
import CardImage from '../../components/images/CardImage';
import { DeckCard, RestrictedList } from '../../types/decks';
import { DrawCardType } from '../../types/enums';
import { Card } from '../../types/data';
import DeckSummary from '../../components/decks/DeckSummary';
import DeckStatus from '../../components/decks/DeckStatus';
import FaIconButton from '../../components/site/FaIconButton';
import { toastr } from 'react-redux-toastr';
import { Constants } from '../../constants';
import { Select, SelectItem } from '@nextui-org/react';
import Alert from '../../components/site/Alert';

const DeckPage = () => {
    const { t } = useTranslation();
    const params = useParams();
    const [restrictedList, setRestrictedList] = useState<string | null>();
    const [deleteDeck] = useDeleteDeckMutation();
    const navigate = useNavigate();
    const [mousePos, setMousePosition] = useState({ x: 0, y: 0 });
    const [zoomCard, setZoomCard] = useState(null);

    const { data, isLoading, isError, isSuccess } = useGetDeckQuery({
        deckId: params.deckId,
        restrictedList: restrictedList
    });
    const {
        data: cardsResponse,
        isLoading: isCardsLoading,
        isError: isCardsError
    } = useGetCardsQuery({});
    const { data: restrictedLists, isLoading: isRestrictedListLoading } = useGetRestrictedListQuery(
        []
    );

    useEffect(() => {
        if (!restrictedList && restrictedLists) {
            setRestrictedList(restrictedLists[0].id);
        }
    }, [restrictedList, restrictedLists]);

    const cardsByCode = useMemo(() => {
        return (
            cardsResponse &&
            Object.assign({}, ...cardsResponse.map((card: Card) => ({ [card.code]: card })))
        );
    }, [cardsResponse]);

    const deck = data?.data;
    let content;

    if (isLoading || isCardsLoading || isRestrictedListLoading) {
        content = <LoadingSpinner text='Loading deck, please wait...' />;
    } else if (isError || isCardsError) {
        content = (
            <Alert variant='danger'>
                {t('An error occured loading your deck. Please try again later.')}
            </Alert>
        );
    } else if (!data.success) {
        content = (
            <div>
                <Alert variant='danger'>
                    {t('An error occured loading your deck. Please try again later.')}
                </Alert>
            </div>
        );
    } else if (isSuccess) {
        const agendas = [];

        if (deck.agenda) {
            agendas.push(deck.agenda.code);
        }

        for (const agenda of deck.deckCards.filter(
            (dc: DeckCard) => dc.type == DrawCardType.Banner
        )) {
            agendas.push(agenda.card.code);
        }

        const agendaContent = agendas.map((agenda: string) => {
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
                    <CardImage className='me-1' imageUrl={`/img/cards/${agenda}.png`} size='md' />
                </span>
            );
        });

        content = (
            <>
                <div>
                    <FaIconButton
                        color='default'
                        icon={faPenToSquare}
                        text='Edit'
                        as={Link}
                        to={`/decks/${deck.id}/edit`}
                    />
                    <FaIconButton
                        color='danger'
                        className='ms-2'
                        icon={faTrashAlt}
                        text='Delete'
                        onClick={() => {
                            toastr.confirm(t('Are you sure you want to delete this deck?'), {
                                okText: t('Yes'),
                                cancelText: t('Cancel'),
                                onOk: async () => {
                                    try {
                                        const response = await deleteDeck(deck.id).unwrap();

                                        navigate('/decks');

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
                            });
                        }}
                    />
                </div>
                <div className='mb-2 mt-2 flex justify-center'>
                    <FactionImage
                        className='mr-1'
                        faction={deck.faction.code}
                        size='md'
                        onMouseOver={() =>
                            setZoomCard(Constants.FactionsImagePaths[deck.faction.code])
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
                    {agendaContent}
                </div>
                <div className='mb-2 mt-2 w-full md:w-2/6'>
                    <Select
                        label={t('Game node')}
                        onChange={(e) => setRestrictedList(e.target.value)}
                        selectedKeys={restrictedList ? new Set([restrictedList]) : null}
                    >
                        {restrictedLists?.map((rl: RestrictedList) => (
                            <SelectItem key={rl.id} value={rl.id}>
                                {t(rl.name)}
                            </SelectItem>
                        ))}
                    </Select>
                </div>
                <div className='grid grid-cols-2'>
                    <div>
                        <dl className='mb-0 mt-3 grid grid-cols-2'>
                            <dt className='font-bold'>
                                <Trans>Faction</Trans>
                            </dt>
                            <dd className='mb-0'>{deck.faction.name}</dd>
                        </dl>
                        {agendas.map((agenda, index) => (
                            <dl key={agenda} className='mb-0 mt-1 grid grid-cols-2'>
                                <dt className='font-bold'>
                                    <Trans>{index == 0 ? 'Agenda' : 'Banner'}</Trans>
                                </dt>
                                <dd className='mb-0'>{cardsByCode[agenda].label}</dd>
                            </dl>
                        ))}
                        {deck.externalId && (
                            <dl className='mb-0 mt-1 grid grid-cols-2'>
                                <dt className='font-bold'>
                                    <Trans>ThronesDB</Trans>
                                </dt>
                                <dd className='mb-0'>
                                    <a
                                        href={`https://thronesdb.com/deck/view/${deck.externalId}`}
                                        target='_blank'
                                        rel='noreferrer'
                                    >
                                        <Trans>Link</Trans>
                                    </a>
                                </dd>
                            </dl>
                        )}
                    </div>
                    <div>
                        <dl className='mb-0 mt-1 grid grid-cols-2'>
                            <dt className='font-bold'>
                                <Trans>Validity</Trans>
                            </dt>
                            <dd className='mb-0'>
                                <DeckStatus status={deck.status} />
                            </dd>
                        </dl>
                        <dl className='mb-0 mt-3 grid grid-cols-2'>
                            <dt className='font-bold'>
                                <Trans>Wins</Trans>
                            </dt>
                            <dd className='mb-0'>{deck.wins}</dd>
                        </dl>
                        <dl className='mb-0 mt-1 grid grid-cols-2'>
                            <dt className='font-bold'>
                                <Trans>Losses</Trans>
                            </dt>
                            <dd className='mb-0'>{deck.losses}</dd>
                        </dl>
                        <dl className='mb-0 mt-1 grid grid-cols-2'>
                            <dt className='font-bold'>
                                <Trans>Win Rate</Trans>
                            </dt>
                            <dd className='mb-0'>
                                {deck.winRate}
                                {deck.winRate && '%'}
                            </dd>
                        </dl>
                    </div>
                </div>
                <DeckSummary deck={deck} />
            </>
        );
    }

    return (
        <div className='mx-auto w-4/5'>
            <Panel title={data?.data.name}>{content}</Panel>
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

export default DeckPage;
