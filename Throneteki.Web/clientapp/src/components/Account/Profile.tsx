import React, { ReactElement, useState, useRef, useEffect } from 'react';
import { Form, Button, Alert, Col, Row, Spinner } from 'react-bootstrap';
import { Formik, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { CustomUserProfile } from '../Navigation/Navigation';
import ProfileBackground from './ProfileBackground';
import ProfileMain from './ProfileMain';
import BlankBg from '../../assets/img/bgs/blank.png';
import Background1 from '../../assets/img/bgs/background.png';
import Background2 from '../../assets/img/bgs/background2.png';

// import KeyforgeGameSettings from '../../components/Profile/KeyforgeGameSettings';
// import ProfileCardSize from '../../components/Profile/ProfileCardSize';

import './Profile.scss';
import ProfileActionWindows from './ProfileActionWindows';

interface SettingsDetails {
    background?: string;
    // cardSize: string;
    // windowTimer: number;
    customBackgroundUrl?: string;
    actionWindows: { [key: string]: boolean };
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
}

export interface ExistingProfileDetails extends ProfileDetails {
    actionWindows: { [window: string]: boolean };
    avatar?: File;
    gameOptions: GameOptionsDetails;
}

export interface NewProfileDetails extends ProfileDetails {
    avatar?: string | null;
    customBackground?: string;
    settings: SettingsDetails;
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
    user: CustomUserProfile | null | undefined;
};

const toBase64 = (file: File): Promise<string | null | undefined> =>
    new Promise<string | null | undefined>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (): void => resolve(reader.result?.toString().split(',')[1]);
        reader.onerror = (error): void => reject(error);
    });

const defaultActionWindows = {
    plot: false,
    draw: false,
    challengeBegin: false,
    attackersDeclared: true,
    defendersDeclared: true,
    dominance: false,
    standing: false,
    taxation: false
};

const ProfileComponent = (props: ProfileProps) => {
    const { user, onSubmit } = props;
    const { t } = useTranslation('profile');

    const settings: SettingsDetails = JSON.parse(user?.throneteki_settings || '{}');
    const [localBackground, setBackground] = useState(settings.background || 'none');
    // const [localCardSize, setCardSize] = useState<string>(user!.settings.cardSize);
    const [customBg, setCustomBg] = useState<string | null | undefined>(null);
    const topRowRef = useRef<HTMLElement>(null);

    useEffect(() => {
        setBackground(settings.background || 'none');
    }, [settings.background]);

    const backgrounds = [
        { name: 'none', label: t('None'), imageUrl: BlankBg },
        { name: 'standard', label: t('Standard'), imageUrl: Background1 },
        { name: 'winter', label: t('Winter'), imageUrl: Background2 }
    ];
    // const cardSizes = [
    //     { name: 'small', label: t('small') },
    //     { name: 'normal', label: t('normal') },
    //     { name: 'large', label: t('large') },
    //     { name: 'x-large', label: t('extra-large') }
    // ];

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
        gameOptions: {
            confirmOneClick: false,
            orderForcedAbilities: false
        },
        actionWindows: settings.actionWindows || defaultActionWindows
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
                    username: values.username,
                    settings: { actionWindows: values.actionWindows }
                };

                if (localBackground) {
                    submitValues.settings.background = localBackground;
                }

                // if (localCardSize) {
                //     submitValues.settings.cardSize = localCardSize;
                // }

                if (customBg) {
                    submitValues.customBackground = customBg;
                }

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
                            <ProfileBackground
                                backgrounds={backgrounds}
                                selectedBackground={localBackground}
                                customBackground={settings?.customBackgroundUrl}
                                onBackgroundSelected={async (name, file) => {
                                    if (name === 'custom') {
                                        if (!file) {
                                            return;
                                        }

                                        const base64File = await toBase64(file);

                                        setCustomBg(base64File);
                                    }

                                    setBackground(name);
                                }}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <ProfileActionWindows formProps={formProps} user={user} />
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
