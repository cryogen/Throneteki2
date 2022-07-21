import React, { ChangeEvent, useRef, useState } from 'react';
import { Col, Form, Button, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import Panel from '../../components/Site/Panel';
import Avatar from '../../components/Site/Avatar';
import { FormikProps } from 'formik';
// import { User, PatreonStatus } from '../../redux/types';
// import { ExistingProfileDetails } from '../../pages/components/Profile';
// import { PatreonClientId, AuthServerUrl } from '../../constants';

import { ExistingProfileDetails } from './Profile';
import PatreonLogo from '../../assets/img/Patreon_Mark_Coral.jpg';
import { CustomUserProfile } from '../Navigation/Navigation';

type ProfileMainProps = {
    formProps: FormikProps<ExistingProfileDetails>;
    user: CustomUserProfile;
};

const ProfileMain = (props: ProfileMainProps) => {
    const { t } = useTranslation('profile');
    const inputFile = useRef<HTMLInputElement>(null);
    const [localAvatar, setAvatar] = useState<string | null>(null);
    const formProps = props.formProps;
    const { user } = props;

    const onAvatarUploadClick = (): void => {
        if (!inputFile.current) {
            return;
        }

        inputFile.current.click();
    };

    // const callbackUrl = `${window.location.origin}/patreon`;
    // const patreonUrl = `https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${PatreonClientId}&redirect_uri=${callbackUrl}`;

    return (
        <Panel title={t('Profile')}>
            <Row>
                <Form.Group as={Col} md='6' className='mt-2' controlId='formGridUsername'>
                    <Form.Label>{t('Username')}</Form.Label>
                    <Form.Control
                        type='text'
                        placeholder={t('Enter a username')}
                        isInvalid={formProps.touched.username && !!formProps.errors.username}
                        {...formProps.getFieldProps('username')}
                    />
                    <Form.Control.Feedback type='invalid'>
                        {formProps.errors.username}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md='6' className='mt-2' controlId='formGridEmail'>
                    <Form.Label>{t('Email')}</Form.Label>
                    <Form.Control
                        type='email'
                        placeholder={t('Enter an email address')}
                        isInvalid={formProps.touched.email && !!formProps.errors.email}
                        {...formProps.getFieldProps('email')}
                    />
                    <Form.Control.Feedback type='invalid'>
                        {formProps.errors.email}
                    </Form.Control.Feedback>
                </Form.Group>
            </Row>
            <Row className='mt-3'>
                <Form.Group as={Col} md='3'>
                    <Form.Label>{t('Avatar')}</Form.Label>
                    <div>
                        {!formProps.errors.avatar && localAvatar ? (
                            <img className='profile-avatar' src={localAvatar} alt={user.name} />
                        ) : (
                            <Avatar avatar={user.picture}></Avatar>
                        )}
                        <Button variant='secondary' onClick={onAvatarUploadClick}>
                            Change avatar
                        </Button>
                    </div>
                    <Form.Control
                        name='avatar'
                        type='file'
                        accept='image/*'
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            if (
                                !event.currentTarget ||
                                !event.currentTarget.files ||
                                event.currentTarget.files.length === 0
                            ) {
                                return;
                            }

                            const file = event.currentTarget.files[0];
                            setAvatar(URL.createObjectURL(file));
                            formProps.setFieldValue('avatar', file);
                        }}
                        onBlur={formProps.handleBlur}
                        hidden
                        ref={inputFile}
                        isInvalid={!!formProps.errors.avatar}
                    ></Form.Control>
                    <Form.Control.Feedback type='invalid'>
                        {formProps.errors.avatar}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md='3'>
                    <Form.Label>{t('Patreon')}</Form.Label>
                    <div>
                        <img
                            className='profile-patreon-icon'
                            src={PatreonLogo}
                            alt={t('Patreon Logo')}
                        />
                        {/* {user!.patreonStatus === PatreonStatus.Unlinked ? (
                            <Button variant='secondary' href={patreonUrl}>
                                Link Account
                            </Button>
                        ) : (
                            <Button variant='secondary'>Unlink Account</Button>
                        )} */}
                    </div>
                </Form.Group>
            </Row>
            <Row className='mt-3'>
                <Form.Group as={Col} md='6' className='mt-2' controlId='formGridPassword'>
                    <Form.Label>{t('Password')}</Form.Label>
                    <Form.Control
                        type='password'
                        placeholder={t('Enter a password')}
                        isInvalid={formProps.touched.password && !!formProps.errors.password}
                        {...formProps.getFieldProps('password')}
                    />
                    <Form.Control.Feedback type='invalid'>
                        {formProps.errors.password}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md='6' className='mt-2' controlId='formGridPassword1'>
                    <Form.Label>{t('Password (again)')}</Form.Label>
                    <Form.Control
                        type='password'
                        placeholder={t('Enter the same password')}
                        isInvalid={
                            formProps.touched.passwordAgain && !!formProps.errors.passwordAgain
                        }
                        {...formProps.getFieldProps('passwordAgain')}
                    />
                    <Form.Control.Feedback type='invalid'>
                        {formProps.errors.passwordAgain}
                    </Form.Control.Feedback>
                </Form.Group>
            </Row>
        </Panel>
    );
};

export default ProfileMain;
