import React from 'react';
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import GameConfiguration from './GameConfiguration';
import { KeywordSettings, PromptedActionWindows, TimerSettings } from '../../../types/game';

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
            <Modal show={true} onHide={onClose} size='lg'>
                <Modal.Header closeButton closeVariant='white'>
                    <Modal.Title>{t('Game Configuration')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
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
                </Modal.Body>
            </Modal>
        </>
    );
};

export default GameConfigurationModal;
