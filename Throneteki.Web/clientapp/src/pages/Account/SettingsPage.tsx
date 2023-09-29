import React from 'react';
import { useAuth } from 'react-oidc-context';

import Settings from '../../components/account/Settings';
import { ThronetekiUser } from '../../types/user';

const SettingsPage: React.FC = () => {
    const auth = useAuth();

    const user = auth.user?.profile as ThronetekiUser;

    return (
        <div>
            <Settings user={user} />
        </div>
    );
};

export default SettingsPage;
