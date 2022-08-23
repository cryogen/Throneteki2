import React from 'react';
import { Col } from 'react-bootstrap';
import { useAuth } from 'react-oidc-context';

import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { RootState } from '../../redux/store';
import Settings, { NewProfileDetails } from '../../components/Account/Settings';
import { CustomUserProfile } from '../../components/Navigation/Navigation';
import ApiStatus from '../../components/Site/ApiStatus';
import { ApiStateStatus } from '../../redux/slices/account';
import { clearUserState, saveProfileAsync } from '../../redux/slices/user';
import LoadingSpinner from '../../components/LoadingSpinner';

const SettingsPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const auth = useAuth();

    const user = auth.user?.profile as CustomUserProfile;

    const userState = useAppSelector((state: RootState) => state.user);

    if (userState.status === ApiStateStatus.Loading) {
        return <LoadingSpinner text='Loading, please wait...' />;
    }

    return (
        <Col lg={{ span: 10, offset: 1 }}>
            <ApiStatus
                onClose={() => dispatch(clearUserState())}
                state={{ status: userState.status, message: userState.message }}
            />
            <Settings
                user={user}
                onSubmit={(values: NewProfileDetails) => {
                    dispatch(saveProfileAsync(values));
                }}
            />
        </Col>
    );
};

export default SettingsPage;
