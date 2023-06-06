import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useGetDeckQuery } from '../../redux/api/apiSlice';
import DeckEditor from '../../components/Decks/DeckEditor';

const EditDeckPage = () => {
    const { t } = useTranslation();
    const params = useParams();

    const { data, isLoading, isError, isSuccess } = useGetDeckQuery({
        deckId: params.deckId
    });

    return (
        <div>
            This would show the deck editor thats in the new section but I havent written it to work
            very generically. Oh well, coming soon I guess?
        </div>
    );
};

export default EditDeckPage;
