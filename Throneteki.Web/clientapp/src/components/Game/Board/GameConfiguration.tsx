import { KeywordSettings, PromptedActionWindows, TimerSettings } from '../../../types/game';
import { useTranslation } from 'react-i18next';
import Panel from '../../site/Panel';
import { Switch } from '@nextui-org/react';

interface GameConfigurationProps {
    actionWindows: PromptedActionWindows;
    keywordSettings: KeywordSettings;
    promptDupes: boolean;
    onActionWindowToggle: (option: string, value: string | boolean) => void;
    onKeywordSettingToggle: (option: string, value: string | boolean) => void;
    onPromptDupesToggle: (value: boolean) => void;
    onTimerSettingToggle: (option: string, value: string | boolean) => void;
    timerSettings: TimerSettings;
}

interface ActionWindow {
    name: keyof PromptedActionWindows;
    label: string;
}

const windows: ActionWindow[] = [
    { name: 'plot', label: 'Plots revealed' },
    { name: 'draw', label: 'Draw phase' },
    { name: 'challengeBegin', label: 'Before challenge' },
    { name: 'attackersDeclared', label: 'Attackers declared' },
    { name: 'defendersDeclared', label: 'Defenders declared' },
    { name: 'dominance', label: 'Dominance phase' },
    { name: 'standing', label: 'Standing phase' },
    { name: 'taxation', label: 'Taxation phase' }
];

const GameConfiguration = ({
    actionWindows,
    keywordSettings,
    promptDupes,
    timerSettings,
    onKeywordSettingToggle,
    onTimerSettingToggle,
    onActionWindowToggle,
    onPromptDupesToggle
}: GameConfigurationProps) => {
    const { t } = useTranslation();

    const windowsToRender = windows.map((window) => {
        return (
            <div key={window.name} md={4}>
                <Switch
                    onChange={(event) =>
                        onActionWindowToggle &&
                        onActionWindowToggle(window.name, event.target.checked)
                    }
                    name={'promptedActionWindows.' + window.name}
                    label={t(window.label)}
                    checked={actionWindows[window.name]}
                />
            </div>
        );
    });

    return (
        <div>
            <form>
                <Panel title={t('Action window defaults')}>
                    <div>{windowsToRender}</div>
                </Panel>
                <Panel title={t('Timed interrupt window')} className='mt-3'>
                    <div>
                        <div>
                            <Switch
                                onChange={(event) =>
                                    onTimerSettingToggle &&
                                    onTimerSettingToggle('events', event.target.checked)
                                }
                                name='timerSettings.events'
                                label={t('Show timer for events')}
                                checked={timerSettings.events}
                            />
                        </div>
                        <div>
                            <Switch
                                onChange={(event) =>
                                    onTimerSettingToggle &&
                                    onTimerSettingToggle('abilities', event.target.checked)
                                }
                                name='timerSettings.abilities'
                                label={t('Show timer for card abilities')}
                                checked={timerSettings.abilities}
                            />
                        </div>
                    </div>
                </Panel>
                <Panel title={t('Other Settings')} className='mt-3'>
                    <div>
                        <div>
                            <Switch
                                onChange={(event) =>
                                    onKeywordSettingToggle &&
                                    onKeywordSettingToggle('chooseOrder', event.target.checked)
                                }
                                name='keywordSettings.chooseOrder'
                                label={t('Choose order of keywords')}
                                checked={keywordSettings.chooseOrder}
                            />
                        </div>
                        <div>
                            <Switch
                                onChange={(event) =>
                                    onKeywordSettingToggle &&
                                    onKeywordSettingToggle('chooseCards', event.target.checked)
                                }
                                name='keywordSettings.chooseCards'
                                label={t('Make keywords optional')}
                                checked={keywordSettings.chooseCards}
                            />
                        </div>
                        <div>
                            <Switch
                                type='switch'
                                onChange={(event) =>
                                    onPromptDupesToggle && onPromptDupesToggle(event.target.checked)
                                }
                                name='promptDupes'
                                label={t('Prompt before using dupes to save')}
                                checked={promptDupes}
                            />
                        </div>
                    </div>
                </Panel>
            </form>
        </div>
    );
};

export default GameConfiguration;
