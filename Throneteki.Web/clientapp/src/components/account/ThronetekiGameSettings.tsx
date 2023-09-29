import { Trans, useTranslation } from 'react-i18next';
import { FormikProps } from 'formik';
import Panel from '../site/Panel';
import { ExistingProfileDetails } from './Settings';
import { ThronetekiUser } from '../../types/user';
import { Input, Switch } from '@nextui-org/react';

type ThronetekiGameSettingsProps = {
    formProps: FormikProps<ExistingProfileDetails>;
    user: ThronetekiUser;
};

const ThronetekiGameSettings = ({ formProps }: ThronetekiGameSettingsProps) => {
    const { t } = useTranslation();

    return (
        <Panel title={t('Game Settings')}>
            <div className='grid grid-cols-2'>
                <div>
                    <p className='form-text small'>
                        <Trans key='timer-help'>
                            Every time a game event occurs that you could possibly interrupt to
                            cancel it, a timer will count down. At the end of that timer, the window
                            will automatically pass. This option controls the duration of the timer.
                            The timer can be configure to show when events are played (useful if you
                            play cards like The Hand&apos;s Judgement) and to show when card
                            abilities are triggered (useful if you play a lot of Treachery).
                        </Trans>
                    </p>
                    <div>
                        <div className='mt-2'>
                            <Input
                                label={t('Window timeout')}
                                type={'number'}
                                max={10}
                                min={0}
                                {...formProps.getFieldProps('windowTimer')}
                                errorMessage={formProps.errors.windowTimer}
                            />
                        </div>
                        <div className='mt-2 flex'>
                            <Switch
                                isSelected={formProps.values.timerEvents}
                                {...formProps.getFieldProps('timerEvents')}
                            >
                                {t('Show timer for events')}
                            </Switch>
                            <Switch
                                className='ml-2'
                                isSelected={formProps.values.timerAbilities}
                                {...formProps.getFieldProps('timerAbilities')}
                            >
                                {t('Show timer for card abilities')}
                            </Switch>
                        </div>
                    </div>
                </div>
                <div className='ml-3 flex flex-col'>
                    <Switch
                        isSelected={formProps.values.chooseOrder}
                        {...formProps.getFieldProps('chooseOrder')}
                    >
                        {t('Choose order of keywords')}
                    </Switch>
                    <Switch
                        className='mt-2'
                        isSelected={formProps.values.chooseCards}
                        {...formProps.getFieldProps('chooseCards')}
                    >
                        {t('Make keywords optional')}
                    </Switch>
                    <Switch
                        className='mt-2'
                        isSelected={formProps.values.promptDupes}
                        {...formProps.getFieldProps('promptDupes')}
                    >
                        {t('Prompt before using dupes to save')}
                    </Switch>
                </div>
            </div>
        </Panel>
    );
};

export default ThronetekiGameSettings;
