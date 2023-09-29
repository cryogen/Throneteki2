import { useTranslation } from 'react-i18next';
import { Deck } from '../../types/decks';
import DeckList from '../decks/DeckList';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react';

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
            <Modal isOpen={true} onClose={onClose} size='5xl'>
                <ModalContent>
                    <ModalHeader>{t('Select Deck')}</ModalHeader>
                    <ModalBody>
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
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};

export default SelectDeckModal;
