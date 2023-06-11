import React, { useState } from 'react';
import { Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import AgendaSelect from '../../components/Decks/AgendaSelect';
import FactionSelect from '../../components/Decks/FactionSelect';
import Panel from '../../components/Site/Panel';
import DeckEditor from '../../components/Decks/DeckEditor';
import { Card, Faction } from '../../types/data';

const NewDeckPage = () => {
    const { t } = useTranslation();
    const [selectedFaction, setFaction] = useState<Faction | undefined>();
    const [selectedAgendas, setAgendas] = useState<Card[] | undefined>();

    return (
        <Col sm={{ span: 12 }}>
            <Panel title={t('New Deck')}>
                {selectedFaction ? (
                    <div>
                        {selectedAgendas ? (
                            <DeckEditor
                                onBackClick={() => setAgendas(undefined)}
                                deck={{
                                    name: t('New Deck'),
                                    faction: selectedFaction,
                                    agenda: selectedAgendas[0],
                                    deckCards: selectedAgendas
                                        .slice(1)
                                        .map((c) => ({ card: c, count: 1 }))
                                }}
                            />
                        ) : (
                            <AgendaSelect
                                onBackClick={() => setFaction(undefined)}
                                onNextClick={(agendas) => setAgendas(agendas)}
                            />
                        )}
                    </div>
                ) : (
                    <FactionSelect onSelect={(faction) => setFaction(faction)} />
                )}
            </Panel>
        </Col>
    );
};

export default NewDeckPage;
