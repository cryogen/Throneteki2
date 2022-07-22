import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Col } from 'react-bootstrap';

import Panel from '../../components/Site/Panel';
import { Login, LoginDetails } from '../../components/Account/Login';
import { ApiStateStatus, loginAsync } from '../../redux/slices/account';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { RootState } from '../../redux/store';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const dispatch = useAppDispatch();
    const account = useAppSelector((state: RootState) => state.account);
    const navigate = useNavigate();

    const { t } = useTranslation();

    useEffect(() => {
        if (account.status === ApiStateStatus.Success) {
            navigate('/authentication/login');
        }
    }, [account.status, navigate]);

    return (
        <Col lg={{ span: 8, offset: 2 }}>
            <Panel title={t('Login')}>
                <Login onSubmit={(values: LoginDetails) => dispatch(loginAsync(values))} />
            </Panel>
        </Col>
    );
};

export default LoginPage;
