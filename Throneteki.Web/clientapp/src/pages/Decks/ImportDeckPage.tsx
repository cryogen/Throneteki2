import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Alert, Button, Col, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

import Panel from '../../components/Site/Panel';
import {
    ApiError,
    useAddDeckMutation,
    useGetCardsQuery,
    useGetFactionsQuery,
    useGetPacksQuery
} from '../../redux/api/apiSlice';
import { Card, Faction } from '../../types/data';
import { lookupCardByName } from '../../helpers/DeckHelper';
import { Deck } from '../../types/decks';
import LoadingSpinner from '../../components/LoadingSpinner';

interface DeckCard {
    count: number;
    card: Card;
}

const ImportDeckPage = () => {
    const { t } = useTranslation();
    const [deckText, setDeckText] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const {
        data: factions,
        isLoading: isFactionsLoading,
        isError: isFactionsError
    } = useGetFactionsQuery({});
    const { data: cards, isLoading: isCardsLoading, isError: isCardsError } = useGetCardsQuery({});
    const { data: packs, isLoading: isPacksLoading, isError: isPacksError } = useGetPacksQuery({});
    const [addDeck, { isLoading: isAddLoading }] = useAddDeckMutation();

    const parseCardLine = (line: string) => {
        const pattern = /^(\d+)x?\s+(.+)$/;

        const match = line.trim().match(pattern);
        if (!match) {
            return { count: 0 };
        }

        const count = parseInt(match[1]);
        const card = lookupCardByName({
            cardName: match[2],
            cards: Object.values(cards),
            packs: packs
        });

        return { count: count, card: card };
    };

    const addCard = (list: DeckCard[], card: Card, number: number) => {
        const cardCode = parseInt(card.code);
        if (list[cardCode]) {
            list[cardCode].count += number;
        } else {
            list.push({ count: number, card: card });
        }
    };

    const processDeck = async () => {
        let split = deckText.split('\n');
        let deckName, faction, agenda, bannerCards;

        const headerMark = split.findIndex((line) => line.match(/^Packs:/));
        if (headerMark >= 0) {
            // ThronesDB-style deck header found
            // extract deck title, faction, agenda, and banners
            let header = split.slice(0, headerMark).filter((line) => line !== '');
            split = split.slice(headerMark);

            if (header.length >= 2) {
                deckName = header[0];

                const newFaction = factions.find(
                    (faction: Faction) => faction.name === header[1].trim()
                );
                if (newFaction) {
                    faction = newFaction;
                }

                header = header.slice(2);
                if (header.length >= 1) {
                    let rawAgenda, rawBanners;

                    if (
                        header.some((line) => {
                            return line.trim() === 'Alliance';
                        })
                    ) {
                        rawAgenda = 'Alliance';
                        rawBanners = header.filter((line) => line.trim() !== 'Alliance');
                    } else {
                        rawAgenda = header[0].trim();
                    }

                    const newAgenda = lookupCardByName({
                        cardName: rawAgenda,
                        cards: Object.values(cards),
                        packs: packs
                    });
                    if (newAgenda) {
                        agenda = newAgenda;
                    }

                    if (rawBanners) {
                        const banners = [];
                        for (const rawBanner of rawBanners) {
                            const banner = lookupCardByName({
                                cardName: rawBanner,
                                cards: Object.values(cards),
                                packs: packs
                            });
                            if (banner) {
                                banners.push(banner);
                            }
                        }

                        bannerCards = banners;
                    }
                }
            }
        } else {
            setError('Invalid deck. Ensure you have exported a plain text deck from ThronesDb.');
        }

        const plotCards: DeckCard[] = [];
        const drawCards: DeckCard[] = [];

        for (const line of split) {
            const { card, count } = parseCardLine(line);
            if (card) {
                addCard(card.type === 'plot' ? plotCards : drawCards, card, count);
            }
        }

        if (!deckName) {
            return;
        }

        const deck: Deck = {
            name: deckName,
            faction: faction.id,
            agenda: agenda?.id,
            bannerCards: bannerCards?.map((banner) => banner.id),
            plotCards: {},
            drawCards: {}
        };

        for (const plot of plotCards) {
            deck.plotCards[plot.card.id] = plot.count;
        }

        for (const draw of drawCards) {
            deck.drawCards[draw.card.id] = draw.count;
        }

        try {
            const response = await addDeck(deck).unwrap();
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
    };

    let content;

    if (isFactionsLoading || isCardsLoading || isPacksLoading) {
        content = <LoadingSpinner text='Loading data, please wait...' />;
    } else if (isFactionsError || isCardsError || isPacksError) {
        <Alert variant='danger'>
            {t('An error occured loading the card data. Please try again later.')}
        </Alert>;
    } else {
        content = (
            <Form
                onSubmit={(event) => {
                    event.preventDefault();

                    setError('');

                    processDeck();
                }}
            >
                <Form.Group className='mb-3' controlId='deckText'>
                    <Form.Label>
                        <Trans>
                            Export your deck as plain text from{' '}
                            <a href='https://thronesdb.com' target='_blank' rel='noreferrer'>
                                ThronesDB
                            </a>{' '}
                            and paste it into this box
                        </Trans>
                    </Form.Label>
                    <Form.Control
                        as='textarea'
                        rows={15}
                        value={deckText}
                        onChange={(event) => setDeckText(event.target.value)}
                    />
                </Form.Group>

                <Button type='submit' disabled={!deckText || isAddLoading}>
                    <Trans>Submit</Trans>
                    &nbsp;
                    {isAddLoading && <FontAwesomeIcon icon={faCircleNotch} spin />}
                </Button>
            </Form>
        );
    }

    return (
        <Col lg={{ span: 8, offset: 2 }}>
            <Panel title={t('Import Deck')}>
                {error && <Alert variant='danger'>{error}</Alert>}
                {success && <Alert variant='success'>{success}</Alert>}
                {content}
            </Panel>
        </Col>
    );
};

export default ImportDeckPage;
