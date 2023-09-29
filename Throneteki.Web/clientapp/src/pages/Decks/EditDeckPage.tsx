import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useGetDeckQuery } from '../../redux/api/apiSlice';
import DeckEditor from '../../components/decks/DeckEditor';
import LoadingSpinner from '../../components/LoadingSpinner';
import Panel from '../../components/site/Panel';
import Alert from '../../components/site/Alert';

const EditDeckPage = () => {
    const { t } = useTranslation();
    const params = useParams();
    const navigate = useNavigate();

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
        content = <DeckEditor deck={data.data} onBackClick={() => navigate('/decks')} />;
    }

    return (
        <div className='w-full'>
            <Panel title={data?.data.name}>{content}</Panel>
        </div>
    );
};

export default EditDeckPage;
