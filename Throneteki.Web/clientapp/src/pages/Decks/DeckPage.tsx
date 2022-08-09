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

        const deckCards = deck.deckCards
            .filter((dc: DeckCard) => dc.type !== 'Banner')
            .map((dc: DeckCard) => ({ card: cardsByCode[dc.card.code], count: dc.count }));

        const groupedCards: Record<string, DeckCard[]> = {};

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
                <div className='mt-2 mb-2'>
                    <span className={`me-1 icon icon-${type}`}></span>
                    <strong>
                        {type[0].toUpperCase() + type.slice(1)} ({cards.length})
                    </strong>
                </div>
            );
            for (const deckCard of cards) {
                currentContainer.push(
                    <>
                        <div key={deckCard.card.code}>
                            {deckCard.count}x{' '}
                            <span
                                className={`me-1 icon icon-${type} text-${deckCard.card.faction.code}`}
                            ></span>
                            {deckCard.card.label}
                        </div>
                    </>
                );
                cardIndex++;

                if (cardIndex > Math.ceil((2 * deckCards.length) / 3)) {
                    currentContainer = splitCards[2];
                } else if (cardIndex > Math.ceil(deckCards.length / 3)) {
                    currentContainer = splitCards[1];
                }
            }
        }

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
                <Row className='mt-3'>
                    <Col sm={4}>{splitCards[0]}</Col>
                    <Col sm={4}>{splitCards[1]}</Col>
                    <Col sm={4}>{splitCards[2]}</Col>
                </Row>
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
