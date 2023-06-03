import React, { useMemo, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useGetCardsQuery } from '../../redux/api/apiSlice';
import { Card } from '../../types/data';
import { Deck, DeckCard, SaveDeckCard } from '../../types/decks';
import CardImage from '../Images/CardImage';

interface DeckSummaryProps {
    deck: Deck;
}

const DeckSummary = ({ deck }: DeckSummaryProps) => {
    const { data: cardsResponse } = useGetCardsQuery({});
    const [mousePos, setMousePosition] = useState({ x: 0, y: 0 });
    const [zoomCard, setZoomCard] = useState(null);

    const cardsByCode = useMemo(() => {
        return (
            cardsResponse &&
            Object.assign({}, ...cardsResponse.map((card: Card) => ({ [card.code]: card })))
        );
    }, [cardsResponse]);

    const groupedCards: Record<string, SaveDeckCard[]> = {};

    const deckCards = deck.deckCards
        .filter((dc: DeckCard) => dc.type !== 'Banner')
        .map((dc: DeckCard) => ({ card: cardsByCode[dc.card.code], count: dc.count }));

    for (const deckCard of deckCards) {
        const type = deckCard.card.type;
        if (!groupedCards[type]) {
            groupedCards[type] = [deckCard];
        } else {
            groupedCards[type].push(deckCard);
        }
    }

    const splitCards: JSX.Element[][] = [[], [], []];
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
                    <div
                        onMouseOver={() => setZoomCard(deckCard.card.code)}
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
                        {deckCard.count}x{' '}
                        <span
                            className={`me-1 icon icon-${type} text-${deckCard.card.faction.code}`}
                        ></span>
                        {deckCard.card.label}
                    </div>
                </React.Fragment>
            );
            cardIndex++;

            if (cardIndex > 36) {
                currentContainer = splitCards[2];
            } else if (cardIndex > 17) {
                currentContainer = splitCards[1];
            }
        }
    }

    return (
        <Row className='mt-3'>
            {zoomCard && (
                <div
                    className='decklist-card-zoom'
                    style={{ left: mousePos.x + 5 + 'px', top: mousePos.y + 'px' }}
                >
                    <CardImage card={zoomCard} size='lg' />
                </div>
            )}
            <Col sm={4}>{splitCards[0]}</Col>
            <Col sm={4}>{splitCards[1]}</Col>
            <Col sm={4}>{splitCards[2]}</Col>
        </Row>
    );
};

export default DeckSummary;
