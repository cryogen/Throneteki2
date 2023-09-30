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
            <div key={window.name}>
                <Switch
                    onValueChange={(checked) =>
                        onActionWindowToggle && onActionWindowToggle(window.name, checked)
                    }
                    name={'promptedActionWindows.' + window.name}
                    isSelected={actionWindows[window.name]}
                >
                    {t(window.label)}
                </Switch>
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
                                onValueChange={(value) =>
                                    onTimerSettingToggle && onTimerSettingToggle('events', value)
                                }
                                name='timerSettings.events'
                                isSelected={timerSettings.events}
                            >
                                {t('Show timer for events')}
                            </Switch>
                        </div>
                        <div>
                            <Switch
                                onValueChange={(value) =>
                                    onTimerSettingToggle && onTimerSettingToggle('abilities', value)
                                }
                                name='timerSettings.abilities'
                                isSelected={timerSettings.abilities}
                            >
                                {t('Show timer for card abilities')}
                            </Switch>
                        </div>
                    </div>
                </Panel>
                <Panel title={t('Other Settings')} className='mt-3'>
                    <div>
                        <div>
                            <Switch
                                onValueChange={(value) =>
                                    onKeywordSettingToggle &&
                                    onKeywordSettingToggle('chooseOrder', value)
                                }
                                name='keywordSettings.chooseOrder'
                                isSelected={keywordSettings.chooseOrder}
                            >
                                {t('Choose order of keywords')}
                            </Switch>
                        </div>
                        <div>
                            <Switch
                                onValueChange={(value) =>
                                    onKeywordSettingToggle &&
                                    onKeywordSettingToggle('chooseCards', value)
                                }
                                name='keywordSettings.chooseCards'
                                isSelected={keywordSettings.chooseCards}
                            >
                                {t('Make keywords optional')}
                            </Switch>
                        </div>
                        <div>
                            <Switch
                                onValueChange={(value) =>
                                    onPromptDupesToggle && onPromptDupesToggle(value)
                                }
                                name='promptDupes'
                                isSelected={promptDupes}
                            >
                                {t('Prompt before using dupes to save')}
                            </Switch>
                        </div>
                    </div>
                </Panel>
            </form>
        </div>
    );
};

export default GameConfiguration;
