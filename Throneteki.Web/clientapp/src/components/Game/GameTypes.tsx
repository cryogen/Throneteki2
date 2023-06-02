import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import { GameType } from '../../types/enums';
import GameTypeInfo from './GameTypeInfo';

interface GameTypesProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formProps: any;
}

const GameTypes = ({ formProps }: GameTypesProps) => {
    const { t } = useTranslation();

    const types = [
        { name: GameType.Beginner, label: t('Beginner') },
        { name: GameType.Casual, label: t('Casual') },
        { name: GameType.Competitive, label: t('Competitive') }
    ];

    return (
        <>
            <Row>
                <Col xs={12}>
                    <GameTypeInfo gameType={formProps.values.gameType} />
                </Col>
            </Row>
            <Row>
                <Col xs={12} className='font-weight-bold'>
                    <Trans>Type</Trans>
                </Col>
                <Form.Group as={Col}>
                    {types.map((type) => (
                        <Form.Check
                            name='gameType'
                            key={type.name}
                            type='radio'
                            id={type.name}
                            label={type.label}
                            inline
                            onChange={formProps.handleChange}
                            value={type.name}
                            checked={formProps.values.gameType === type.name}
                        ></Form.Check>
                    ))}
                </Form.Group>
            </Row>
        </>
    );
};

export default GameTypes;
