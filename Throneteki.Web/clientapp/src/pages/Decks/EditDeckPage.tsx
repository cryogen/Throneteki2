import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useGetDeckQuery } from '../../redux/api/apiSlice';
import DeckEditor from '../../components/Decks/DeckEditor';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Alert, Col } from 'react-bootstrap';
import Panel from '../../components/Site/Panel';

const EditDeckPage = () => {
    const { t } = useTranslation();
    const params = useParams();

    const { data, isLoading, isError, isSuccess } = useGetDeckQuery({
        deckId: params.deckId
    });

    let content;

    if (isLoading) {
        content = <LoadingSpinner text='Loading deck, please wait...' />;
    } else if (isError) {
        content = (
            <Alert variant='danger'>
                {t('An error occured loading your deck. Please try again later.')}
            </Alert>
        );
    } else if (!data.success) {
        content = (
            <div>
                <Alert variant='danger'>
                    {t('An error occured loading your deck. Please try again later.')}
                </Alert>
            </div>
        );
    } else if (isSuccess) {
        content = <DeckEditor deck={data.data} onBackClick={() => console.info('back')} />;
    }

    return (
        <Col lg={{ span: 12 }}>
            <Panel title={data?.data.name}>{content}</Panel>
        </Col>
    );
};

export default EditDeckPage;
