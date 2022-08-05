import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Col, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCirclePlus, faDownload } from '@fortawesome/free-solid-svg-icons';
import { LinkContainer } from 'react-router-bootstrap';

import Panel from '../../components/Site/Panel';
import FaIconButton from '../Site/FaIconButton';

const Decks = () => {
    const { t } = useTranslation();

    return (
        <Panel title={t('Decks')}>
            <Row>
                <Col sm={4}>
                    <LinkContainer to='/decks/new'>
                        <FaIconButton className='col-12' icon={faFileCirclePlus} text='New' />
                    </LinkContainer>
                </Col>
                <Col sm={4}>
                    <LinkContainer to='/decks/import'>
                        <FaIconButton className='col-12' icon={faDownload} text='New' />
                    </LinkContainer>
                </Col>
                <Col sm={4}>
                    <LinkContainer to='/decks/thronesdb'>
                        <Button className='col-12'>
                            <Trans>
                                <span className='pe-2'>ThronesDB</span>
                            </Trans>
                            <span className='icon icon-power'></span>
                        </Button>
                    </LinkContainer>
                </Col>
            </Row>
        </Panel>
    );
};

export default Decks;
