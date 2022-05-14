import React from 'react';
import { useTranslation } from 'react-i18next';
import { Col } from 'react-bootstrap';

import Panel from '../../components/Site/Panel';
import { Login, LoginDetails } from '../../components/Account/Login';
import { ApiStateStatus, loginAsync } from '../../slices/account';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { RootState } from '../../app/store';

const LoginPage = () => {
    const dispatch = useAppDispatch();
    const account = useAppSelector((state: RootState) => state.account);

    const { t } = useTranslation();

    if (account.status === ApiStateStatus.Success) {
        window.location.href = account.returnUrl || '/';
        return <></>;
    }

    return (
        <Col lg={{ span: 8, offset: 2 }}>
            <Panel title={t('Login')}>
                <Login onSubmit={(values: LoginDetails) => dispatch(loginAsync(values))} />
            </Panel>
        </Col>
    );
};

export default LoginPage;
