import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Trans } from 'react-i18next';

import { Constants } from '../../constants';
import FactionImage from '../Images/FactionImage';

interface FactionSelectProps {
    onSelect: (faction: string) => void;
}

const FactionSelect = ({ onSelect }: FactionSelectProps) => {
    const factions = Constants.Factions;

    return (
        <>
            <Row>
                <Col sm={12} className='text-center mb-3'>
                    <h4>
                        <Trans>To start, select a faction</Trans>
                    </h4>
                </Col>
            </Row>
            <Row>
                {factions.map((faction) => (
                    <Col sm='3' key={faction} className='mt-2 mb-2 d-flex justify-content-center'>
                        <div role='button' onClick={() => onSelect(faction)}>
                            <FactionImage size='lg' faction={faction} />
                        </div>
                    </Col>
                ))}
            </Row>
        </>
    );
};

export default FactionSelect;
