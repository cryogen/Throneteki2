import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AgendaSelect from '../../components/decks/AgendaSelect';
import FactionSelect from '../../components/decks/FactionSelect';
import Panel from '../../components/site/Panel';
import DeckEditor from '../../components/decks/DeckEditor';
import { Card, Faction } from '../../types/data';

const NewDeckPage = () => {
    const { t } = useTranslation();
    const [selectedFaction, setFaction] = useState<Faction | undefined>();
    const [selectedAgendas, setAgendas] = useState<Card[] | undefined>();

    return (
        <div>
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
        </div>
    );
};

export default NewDeckPage;
