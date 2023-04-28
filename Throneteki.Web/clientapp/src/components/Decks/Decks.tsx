import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button } from 'react-bootstrap';
import { faFileCirclePlus, faDownload } from '@fortawesome/free-solid-svg-icons';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';

import Panel from '../../components/Site/Panel';
import FaIconButton from '../Site/FaIconButton';

import DeckList from './DeckList';

const Decks = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <Panel title={t('Decks')}>
            <div className='mb-3'>
                <LinkContainer to='/decks/new'>
                    <FaIconButton variant='light' icon={faFileCirclePlus} text='New' />
                </LinkContainer>
                <LinkContainer to='/decks/import'>
                    <FaIconButton
                        variant='light'
                        className='ms-2'
                        icon={faDownload}
                        text='Import'
                    />
                </LinkContainer>
                <LinkContainer to='/decks/thronesdb'>
                    <Button variant='light' className='ms-2'>
                        <Trans>
                            <span className='pe-2'>ThronesDB</span>
                        </Trans>
                        <span className='icon icon-power'></span>
                    </Button>
                </LinkContainer>
            </div>
            <DeckList onDeckSelected={(deck) => navigate(`/decks/${deck.id}/`)} />
        </Panel>
    );
};

export default Decks;
