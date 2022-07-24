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

const LoginPage = () => {
    const dispatch = useAppDispatch();
    const loginStatus = useAppSelector((state) => state.account.status);
    const message = useAppSelector((state) => state.account.message);
    const navigate = useNavigate();

    const { t } = useTranslation();

    useEffect(() => {
        if (loginStatus === ApiStateStatus.Success) {
            navigate('/authentication/login');
        }
    }, [loginStatus, navigate]);

    if (loginStatus === ApiStateStatus.Loading) {
        return <LoadingSpinner text='Logging in, please wait...' />;
    }

    return (
        <Col lg={{ span: 8, offset: 2 }}>
            <ApiStatus
                onClose={() => dispatch(clearState())}
                state={{ status: loginStatus, message: message }}
            />
            <Panel title={t('Login')}>
                <Login onSubmit={(values: LoginDetails) => dispatch(loginAsync(values))} />
            </Panel>
        </Col>
    );
};

export default LoginPage;
