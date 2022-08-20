import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from 'react-oidc-context';

const LoginPage = () => {
    const auth = useAuth();

    const { t } = useTranslation();

    useEffect(() => {
        auth.signinRedirect();
    }, []);

    return (
        <LoadingSpinner text={t('Redirecting you to the authentication server, please wait...')} />
    );
};

export default LoginPage;
