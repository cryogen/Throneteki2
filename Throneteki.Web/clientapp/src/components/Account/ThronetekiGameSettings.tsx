import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import { FormikProps } from 'formik';
import Panel from '../Site/Panel';
import { ExistingProfileDetails } from './Settings';
import { CustomUserProfile } from '../Navigation/Navigation';

type ThronetekiGameSettingsProps = {
    formProps: FormikProps<ExistingProfileDetails>;
    user: CustomUserProfile;
};

const ThronetekiGameSettings = ({ formProps }: ThronetekiGameSettingsProps) => {
    const { t } = useTranslation();

    return (
        <Panel title={t('Game Settings')}>
            <Row>
                <Col sm={12}>
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
                </Col>
                <Col sm={6}>
                    <Row>
                        <Col sm={6}>
                            <Form.Label>{t('Window timeout')}</Form.Label>
                            <Form.Control
                                type={'number'}
                                max={10}
                                min={0}
                                {...formProps.getFieldProps('windowTimer')}
                            />
                            <Form.Control.Feedback type='invalid'>
                                {formProps.errors.windowTimer}
                            </Form.Control.Feedback>
                        </Col>
                        <Col sm={6}>
                            <Form.Check
                                label={t('Show timer for events')}
                                type='switch'
                                checked={formProps.values.timerEvents}
                                {...formProps.getFieldProps('timerEvents')}
                            />{' '}
                            <Form.Check
                                label={t('Show timer for card abilities')}
                                type='switch'
                                checked={formProps.values.timerAbilities}
                                {...formProps.getFieldProps('timerAbilities')}
                            />
                        </Col>
                    </Row>
                </Col>
                <Col sm={6}>
                    <Form.Check
                        label={t('Choose order of keywords')}
                        type='switch'
                        checked={formProps.values.chooseOrder}
                        {...formProps.getFieldProps('chooseOrder')}
                    />
                    <Form.Check
                        label={t('Make keywords optional')}
                        type='switch'
                        checked={formProps.values.chooseCards}
                        {...formProps.getFieldProps('chooseCards')}
                    />
                    <Form.Check
                        label={t('Prompt before using dupes to save')}
                        type='switch'
                        checked={formProps.values.promptDupes}
                        {...formProps.getFieldProps('promptDupes')}
                    />
                </Col>
            </Row>
        </Panel>
    );
};

export default ThronetekiGameSettings;
