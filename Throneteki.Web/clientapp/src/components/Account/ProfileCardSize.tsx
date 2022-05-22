import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import Panel from '../Site/Panel';
import CardSizeOption from './CardSizeOption';

export interface ProfileCardSizeOption {
    name: string;
    label: string;
}

interface CardSizeProps {
    cardSizes: ProfileCardSizeOption[];
    selectedCardSize: string;
    onCardSizeSelected(cardSize: string): void;
}
const ProfileCardSize = ({ cardSizes, selectedCardSize, onCardSizeSelected }: CardSizeProps) => {
    const { t } = useTranslation();

    return (
        <Panel title={t('Card Image Size')}>
            <Row>
                <Col xs='12'>
                    {cardSizes.map((cardSize) => (
                        <CardSizeOption
                            key={cardSize.name}
                            label={cardSize.label}
                            name={cardSize.name}
                            onSelect={onCardSizeSelected}
                            selected={selectedCardSize === cardSize.name}
                        />
                    ))}
                </Col>
            </Row>
        </Panel>
    );
};

export default ProfileCardSize;
