import React from 'react';
import { Col } from 'react-bootstrap';

import Decks from '../../components/Decks/Decks';

const DecksPage = () => {
    return (
        <Col lg={{ span: 12 }}>
            <Decks />
        </Col>
    );
};

export default DecksPage;
