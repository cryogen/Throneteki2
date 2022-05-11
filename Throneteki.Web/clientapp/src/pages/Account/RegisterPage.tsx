import React from 'react';
import { useTranslation } from 'react-i18next';
import { Col } from 'react-bootstrap';

import Panel from '../../components/Site/Panel';
import { Register, RegisterDetails } from '../../components/Account/Register';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { RootState } from '../../app/store';
import { clearState, registerAsync } from '../../slices/account';
import ApiStatus from '../../components/Site/ApiStatus';

const RegisterPage = () => {
    const dispatch = useAppDispatch();
    const account = useAppSelector((state: RootState) => state.account);

    const { t } = useTranslation();

    // if (account.status === ApiStatus.Success) {
    //     window.location.href = account.returnUrl || '/';
    //     return <></>;
    // }

    return (
        <Col lg={{ span: 8, offset: 2 }}>
            <Panel title={t('Register')}>
                <ApiStatus
                    onClose={() => dispatch(clearState())}
                    state={{ status: account.status, message: account.message }}
                />
                <Register onSubmit={(values: RegisterDetails) => dispatch(registerAsync(values))} />
            </Panel>
        </Col>
    );
};

export default RegisterPage;
