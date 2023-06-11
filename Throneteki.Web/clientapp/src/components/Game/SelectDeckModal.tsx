import React from 'react';
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Deck } from '../../types/decks';
import DeckList from '../Decks/DeckList';

interface SelectDeckModalProps {
    onClose: () => void;
    onDeckSelected: (deck: Deck) => void;
    restrictedList?: string;
}

const SelectDeckModal = ({ onClose, onDeckSelected, restrictedList }: SelectDeckModalProps) => {
    //  const standaloneDecks = useSelector((state) => state.cards.standaloneDecks);
    const { t } = useTranslation();

    return (
        <>
            <Modal show={true} onHide={onClose} size='lg'>
                <Modal.Header closeButton>
                    <Modal.Title>{t('Select Deck')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        <DeckList
                            onDeckSelected={onDeckSelected}
                            readOnly={true}
                            restrictedList={restrictedList}
                        />
                        {/*standaloneDecks && standaloneDecks.length !== 0 && (
                            <div>
                                <h4 className='deck-list-header'>
                                    <Trans>Or choose a standalone deck</Trans>:
                                </h4>
                                <DeckList standaloneDecks onDeckSelected={onDeckSelected} />
                            </div>
                        )*/}
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default SelectDeckModal;
