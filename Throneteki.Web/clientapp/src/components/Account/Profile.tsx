import React, { ReactElement, useState, useRef } from 'react';
import { Form, Button, Alert, Col, Row, Spinner } from 'react-bootstrap';
import { Formik, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

// import { User } from '../../redux/types';
// import ProfileMain from '../../components/Profile/ProfileMain';
// import ProfileBackground from '../../components/Profile/ProfileBackground';
// import KeyforgeGameSettings from '../../components/Profile/KeyforgeGameSettings';
// import ProfileCardSize from '../../components/Profile/ProfileCardSize';

import './Profile.scss';
import { Profile } from 'oidc-client';
import ProfileMain from './ProfileMain';

interface SettingsDetails {
    background: string;
    cardSize: string;
    windowTimer: number;
}

interface GameOptionsDetails {
    orderForcedAbilities: boolean;
    confirmOneClick: boolean;
}

interface ProfileDetails {
    userId: string;
    username: string;
    password?: string;
    passwordAgain?: string;
    email?: string;
    settings: SettingsDetails;
}

export interface ExistingProfileDetails extends ProfileDetails {
    gameOptions: GameOptionsDetails;
    avatar?: File;
}

export interface NewProfileDetails extends ProfileDetails {
    customData: string;
    avatar?: string | null;
}

export interface BackgroundOption {
    name: string;
    label: string;
    imageUrl: string;
}

export interface ProfileCardSizeOption {
    name: string;
    label: string;
}

type ProfileProps = {
    onSubmit: (values: NewProfileDetails) => void;
    user: Profile | null | undefined;
};

const ProfileComponent = (props: ProfileProps) => {
    const { user, onSubmit } = props;
    const { t } = useTranslation('profile');
    // const [localBackground, setBackground] = useState<string>(user!.settings.background);
    // const [localCardSize, setCardSize] = useState<string>(user!.settings.cardSize);
    const topRowRef = useRef<HTMLElement>(null);

    // const backgrounds = [{ name: 'none', label: t('none'), imageUrl: 'img/bgs/blank.png' }];
    // const cardSizes = [
    //     { name: 'small', label: t('small') },
    //     { name: 'normal', label: t('normal') },
    //     { name: 'large', label: t('large') },
    //     { name: 'x-large', label: t('extra-large') }
    // ];

    const toBase64 = (file: File): Promise<string | null | undefined> =>
        new Promise<string | null | undefined>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (): void => resolve(reader.result?.toString().split(',')[1]);
            reader.onerror = (error): void => reject(error);
        });

    if (!user) {
        return <Alert variant='danger'>You need to be logged in to view your profile.</Alert>;
    }

    const initialValues: ExistingProfileDetails = {
        userId: user.sub,
        avatar: undefined,
        password: '',
        passwordAgain: '',
        username: user.name || '',
        email: user.email,
        settings: {
            background: '',
            cardSize: '',
            windowTimer: 0
        },
        gameOptions: {
            confirmOneClick: false,
            orderForcedAbilities: false
        }
    };

    const schema = yup.object({
        avatar: yup
            .mixed()
            .test(
                'fileSize',
                t('Image must be less than 100KB in size'),
                (value) => !value || value.size <= 100 * 1024
            )
            .test(
                'fileType',
                t('Unsupported image format'),
                (value) =>
                    !value ||
                    ['image/jpg', 'image/jpeg', 'image/gif', 'image/png'].includes(value.type)
            ),
        email: yup
            .string()
            .email(t('Please enter a valid email address'))
            .required(t('You must specify an email address'))
    });

    return (
        <Formik
            validationSchema={schema}
            onSubmit={async (values: ExistingProfileDetails): Promise<void> => {
                const submitValues: NewProfileDetails = {
                    userId: user.sub,
                    avatar: values.avatar ? await toBase64(values.avatar) : null,
                    email: values.email,
                    settings: values.settings,
                    customData: JSON.stringify(values.gameOptions),
                    username: values.username
                };

                // if (localBackground) {
                //     submitValues.settings.background = localBackground;
                // }

                // if (localCardSize) {
                //     submitValues.settings.cardSize = localCardSize;
                // }

                onSubmit(submitValues);

                if (!topRowRef || !topRowRef.current) {
                    return;
                }

                topRowRef.current.scrollIntoView(false);
            }}
            initialValues={initialValues}
        >
            {(formProps: FormikProps<ExistingProfileDetails>): ReactElement => (
                <Form
                    className='profile-form'
                    onSubmit={(event: React.FormEvent<HTMLFormElement>): void => {
                        event.preventDefault();
                        formProps.handleSubmit(event);
                    }}
                >
                    <Row ref={topRowRef}>
                        <Col sm='12'>
                            <ProfileMain formProps={formProps} user={user} />
                        </Col>
                    </Row>
                    <Row>
                        <Col sm='12'>
                            {/* <ProfileBackground
                                backgrounds={backgrounds}
                                selectedBackground={localBackground || user!.settings.background}
                                onBackgroundSelected={(name): void => setBackground(name)}
                            /> */}
                        </Col>
                    </Row>
                    <Row>
                        <Col sm='6'>
                            {/* <ProfileCardSize
                                cardSizes={cardSizes}
                                selectedCardSize={localCardSize || user!.settings.cardSize}
                                onCardSizeSelected={(name): void => setCardSize(name)}
                            /> */}
                        </Col>
                        <Col sm='6'>
                            {/* <KeyforgeGameSettings formProps={formProps} user={user} /> */}
                        </Col>
                    </Row>
                    <div className='text-center profile-submit'>
                        <Button variant='primary' type='submit'>
                            {/* {isLoading ? (
                                <Spinner
                                    animation='border'
                                    size='sm'
                                    as={'span'}
                                    role='status'
                                    aria-hidden='true'
                                />
                            ) : null} */}
                            {t('Save')}
                        </Button>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default ProfileComponent;
