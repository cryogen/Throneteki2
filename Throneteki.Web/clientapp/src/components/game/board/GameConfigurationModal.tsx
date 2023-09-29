import { useTranslation } from 'react-i18next';
import GameConfiguration from './GameConfiguration';
import { KeywordSettings, PromptedActionWindows, TimerSettings } from '../../../types/game';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react';

interface GameConfigurationModalProps {
    keywordSettings: KeywordSettings;
    onClose: () => void;
    onKeywordSettingToggle: (option: string, value: string | boolean) => void;
    onPromptDupesToggle: (value: boolean) => void;
    onPromptedActionWindowToggle: (option: string, value: string | boolean) => void;
    onTimerSettingToggle: (option: string, value: string | boolean) => void;
    promptDupes: boolean;
    promptedActionWindows: PromptedActionWindows;
    timerSettings: TimerSettings;
}

const GameConfigurationModal = ({
    keywordSettings,
    onClose,
    onKeywordSettingToggle,
    onPromptDupesToggle,
    onPromptedActionWindowToggle,
    onTimerSettingToggle,
    promptDupes,
    promptedActionWindows,
    timerSettings
}: GameConfigurationModalProps) => {
    const { t } = useTranslation();

    return (
        <>
            <Modal isOpen={true} onClose={onClose} size='lg'>
                <ModalContent>
                    <ModalHeader>{t('Game Configuration')}</ModalHeader>
                    <ModalBody>
                        <GameConfiguration
                            actionWindows={promptedActionWindows}
                            keywordSettings={keywordSettings}
                            promptDupes={promptDupes}
                            timerSettings={timerSettings}
                            onKeywordSettingToggle={onKeywordSettingToggle}
                            onTimerSettingToggle={onTimerSettingToggle}
                            onActionWindowToggle={onPromptedActionWindowToggle}
                            onPromptDupesToggle={onPromptDupesToggle}
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};

export default GameConfigurationModal;
