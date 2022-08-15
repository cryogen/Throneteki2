import React, { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Alert, Col, Row } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

import Panel from '../../components/Site/Panel';
import { useGetCardsQuery, useGetDeckQuery } from '../../redux/api/apiSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import FactionImage from '../../components/Images/FactionImage';
import CardImage from '../../components/Images/CardImage';
import { DeckCard } from '../../types/decks';
import { DrawCardType } from '../../types/enums';
import { Card } from '../../types/data';
import DeckSummary from '../../components/Decks/DeckSummary';

const DeckPage = () => {
    const { t } = useTranslation();
    const params = useParams();

    const { data, isLoading, isError, isSuccess } = useGetDeckQuery(params.deckId);
    const {
        data: cardsResponse,
        isLoading: isCardsLoading,
        isError: isCardsError
    } = useGetCardsQuery({});

    const cardsByCode = useMemo(() => {
        return (
            cardsResponse &&
            Object.assign({}, ...cardsResponse.map((card: Card) => ({ [card.code]: card })))
        );
    }, [cardsResponse]);

    const deck = data?.deck;
    let content;

    if (isLoading || isCardsLoading) {
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
            return <CardImage className='me-1' key={agenda} card={agenda} size='md' />;
        });

        content = (
            <>
                <div className='d-flex justify-content-center'>
                    <FactionImage className='me-1' faction={deck.faction.code} size='md' />
                    {agendaContent}
                </div>
                <Row className='mt-3 mb-0' as='dl'>
                    <Col sm={3} as='dt'>
                        <Trans>Faction</Trans>
                    </Col>
                    <Col sm={3} className='mb-0' as='dd'>
                        {deck.faction.name}
                    </Col>
                </Row>
                {agendas.map((agenda, index) => (
                    <Row key={agenda} className='mb-0' as='dl'>
                        <Col sm={3} as='dt'>
                            <Trans>{index == 0 ? 'Agenda' : 'Banner'}</Trans>
                        </Col>
                        <Col sm={3} className='mb-0' as='dd'>
                            {cardsByCode[agenda].label}
                        </Col>
                    </Row>
                ))}
                {deck.externalId && (
                    <Row className='mb-0' as='dl'>
                        <Col sm={3} as='dt'>
                            <Trans>ThronesDB</Trans>
                        </Col>
                        <Col sm={3} className='mb-0' as='dd'>
                            <a
                                href={`https://thronesdb.com/deck/view/${deck.externalId}`}
                                target='_blank'
                                rel='noreferrer'
                            >
                                <Trans>Link</Trans>
                            </a>
                        </Col>
                    </Row>
                )}
                <DeckSummary deck={deck} />
            </>
        );
    }

    return (
        <Col lg={{ span: 8, offset: 2 }}>
            <Panel title={data?.deck.name}>{content}</Panel>
        </Col>
    );
};

export default DeckPage;
