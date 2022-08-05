import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Col } from 'react-bootstrap';

import Panel from '../../components/Site/Panel';
import { useGetThronesDbStatusQuery } from '../../redux/api/apiSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import ThronesDbDecks from '../../components/Decks/ThronesDbDecks';

const ThronesDbDecksPage = () => {
    const { t } = useTranslation();

    const { data: response, isLoading, isError } = useGetThronesDbStatusQuery({});

    let content;

    if (isLoading) {
        content = <LoadingSpinner text='Checking ThronesDB link status, please wait...' />;
    } else if (isError || !response.success) {
        content = (
            <Alert variant='danger'>
                {t('An error occured checking ThronesDB data. Please try again later.')}
            </Alert>
        );
    } else if (response.linked) {
        content = <ThronesDbDecks />;
    } else {
        content = <div>Link your account yo</div>;
    }

    return (
        <Col lg={{ span: 12, offset: 0 }}>
            <Panel title={t('Import ThronesDB decks')}>{content}</Panel>
        </Col>
    );
};

export default ThronesDbDecksPage;
