import React from 'react';
import { Col } from 'react-bootstrap';
import { useAuth } from 'react-oidc-context';

import Settings from '../../components/Account/Settings';
import { CustomUserProfile } from '../../components/Navigation/Navigation';

const SettingsPage: React.FC = () => {
    const auth = useAuth();

    const user = auth.user?.profile as CustomUserProfile;

    return (
        <Col lg={{ span: 10, offset: 1 }}>
            <Settings user={user} />
        </Col>
    );
};

export default SettingsPage;
