import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';

interface GameOptionsProps {
    formProps: any;
}

const GameOptions = ({ formProps }: GameOptionsProps) => {
    const { t } = useTranslation();

    const options = [
        { name: 'allowSpectators', label: t('Allow spectators') },
        { name: 'showHand', label: t('Show hands to spectators') },
        { name: 'muteSpectators', label: t('Mute spectators') },
        { name: 'useGameTimeLimit', label: t('Use a time limit (in minutes)') },
        { name: 'gamePrivate', label: t('Private (requires game link)') },
        {
            name: 'useChessClocks',
            label: t('Use chess clocks with a time limit per player (in minutes)')
        }
    ];

    return (
        <>
            <Form.Group>
                <Row>
                    <Col xs={12} className='font-weight-bold'>
                        <Trans>Options</Trans>
                    </Col>
                    {options.map((option) => (
                        <Col key={option.name} lg='4'>
                            <Form.Check
                                type='switch'
                                id={option.name}
                                label={option.label}
                                inline
                                onChange={formProps.handleChange}
                                value='true'
                                checked={formProps.values[option.name]}
                            ></Form.Check>
                        </Col>
                    ))}
                </Row>
            </Form.Group>
            {formProps.values.useGameTimeLimit && (
                <Row>
                    <Form.Group as={Col} sm={4}>
                        <Form.Label>{t('Time Limit')}</Form.Label>
                        <Form.Control
                            type='text'
                            placeholder={t('Enter time limit')}
                            {...formProps.getFieldProps('gameTimeLimit')}
                        />
                        <Form.Control.Feedback type='invalid'>
                            {formProps.errors.gameTimeLimit}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Row>
            )}
            {formProps.values.useChessClocks && (
                <Row className='mt-2'>
                    <Form.Group as={Col} sm={4}>
                        <Form.Label>{t('Chess Clock Limit')}</Form.Label>
                        <Form.Control
                            type='text'
                            placeholder={t('Enter time limit')}
                            {...formProps.getFieldProps('gameChessClockLimit')}
                        />
                        <Form.Control.Feedback type='invalid'>
                            {formProps.errors.gameChessClockLimit}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Row>
            )}
        </>
    );
};

export default GameOptions;
