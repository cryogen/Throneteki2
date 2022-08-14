import React, { useState } from 'react';
import { Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import AgendaSelect from '../../components/Decks/AgendaSelect';
import FactionSelect from '../../components/Decks/FactionSelect';
import Panel from '../../components/Site/Panel';
import DeckEditor from '../../components/Decks/DeckEditor';

const NewDeckPage = () => {
    const { t } = useTranslation();
    const [selectedFaction, setFaction] = useState<string | undefined>();
    const [selectedAgendas, setAgendas] = useState<string[] | undefined>();

    return (
        <Col sm={{ span: 12 }}>
            <Panel title={t('New Deck')}>
                {selectedFaction ? (
                    <div>
                        {selectedAgendas ? (
                            <DeckEditor
                                onBackClick={() => setAgendas(undefined)}
                                deck={{ faction: selectedFaction, agendas: selectedAgendas }}
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
