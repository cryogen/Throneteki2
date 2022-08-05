import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Col } from 'react-bootstrap';

import Panel from '../../components/Site/Panel';
import { Login, LoginDetails } from '../../components/Account/Login';
import { ApiStateStatus, clearState, loginAsync } from '../../redux/slices/account';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import ApiStatus from '../../components/Site/ApiStatus';
import Decks from '../../components/Decks/Decks';

const DecksPage = () => {
    const dispatch = useAppDispatch();
    const loginStatus = useAppSelector((state) => state.account.status);
    const message = useAppSelector((state) => state.account.message);
    const navigate = useNavigate();

    const { t } = useTranslation();

    return (
        <Col lg={{ span: 5, offset: 1 }}>
            <Decks />
        </Col>
    );
};

export default DecksPage;
