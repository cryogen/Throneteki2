import React, { useEffect } from 'react';
import { Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { RootState } from '../../app/store';
import ProfileComponent, { NewProfileDetails } from '../../components/Account/Profile';
import { CustomUserProfile } from '../../components/Navigation/Navigation';
import ApiStatus from '../../components/Site/ApiStatus';
import { ApiStateStatus } from '../../slices/account';
import { clearUserState, saveProfileAsync } from '../../slices/user';

const ProfileContainer: React.FC = () => {
    const { t } = useTranslation('profile');
    const dispatch = useAppDispatch();
    const account = useAppSelector((state: RootState) => state.account);
    const auth = useAuth();

    const user = auth.user?.profile as CustomUserProfile;

    const userState = useAppSelector((state: RootState) => state.user);

    useEffect(() => {
        if (userState.status === ApiStateStatus.Success) {
            auth.signinSilent();
        }
    }, [userState.status]);
    // const authState = useSelector<RootState, AuthState | undefined>(state => state.auth);
    // const apiState = useSelector<RootState, ApiResponseState | undefined>(state => {
    //     const retState = state.api.requests[Auth.UpdateProfile];

    //     if (retState && retState.success) {
    //         retState.message = t(
    //             'Profile saved successfully.  Please note settings changed here may only apply at the start of your next game.'
    //         );

    //         setTimeout(() => {
    //             dispatch(clearApiStatus(Auth.UpdateProfile));
    //         }, 5000);
    //     }

    //     return retState;
    // });

    // if (!authState || !authState.user) {
    //     return <Alert variant='danger'>{t('You need to be logged in to view your profile')}</Alert>;
    // }

    return (
        <Col lg={{ span: 10, offset: 1 }}>
            <ApiStatus
                onClose={() => dispatch(clearUserState())}
                state={{ status: account.status, message: account.message }}
            />
            <ProfileComponent
                user={user}
                onSubmit={(values: NewProfileDetails) => {
                    dispatch(saveProfileAsync(values));
                }}
            />
        </Col>
    );
};

export default ProfileContainer;
