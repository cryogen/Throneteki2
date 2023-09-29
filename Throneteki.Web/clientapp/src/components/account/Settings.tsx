import React, { ReactElement, useState, useRef, useEffect } from 'react';
import { Formik, FormikProps } from 'formik';
import { Trans, useTranslation } from 'react-i18next';

import SettingsBackground from './SettingsBackground';
import SettingsActionWindows from './SettingsActionWindows';
import SettingsCardSize from './SettingsCardSize';
import ThronetekiGameSettings from './ThronetekiGameSettings';

import BlankBg from '../../assets/img/bgs/blank.png';
import Background1 from '../../assets/img/bgs/background.png';
import Background2 from '../../assets/img/bgs/background2.png';
import { ApiError, useSaveUserMutation } from '../../redux/api/apiSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { ThronetekiUser } from '../../types/user';
import Alert, { AlertType } from '../site/Alert';
import { Button } from '@nextui-org/react';

interface GameSettings {
    chooseOrder: boolean;
    chooseCards: boolean;
    promptDupes: boolean;
    windowTimer: number;
    timerEvents: boolean;
    timerAbilities: boolean;
}

interface SettingsDetails extends GameSettings {
    background?: string;
    cardSize?: string;
    customBackgroundUrl?: string;
    actionWindows: { [key: string]: boolean };
}

interface ProfileDetails {
    userId: string;
}

export interface ExistingProfileDetails extends ProfileDetails, GameSettings {
    actionWindows: { [window: string]: boolean };
    avatar?: File;
}

export interface NewProfileDetails extends ProfileDetails {
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
    user: ThronetekiUser | null | undefined;
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

const Settings = ({ user }: ProfileProps) => {
    const { t } = useTranslation('profile');

    const cardSizes = [
        { name: 'small', label: t('Small') },
        { name: 'normal', label: t('Normal') },
        { name: 'large', label: t('Large') },
        { name: 'x-large', label: t('Extra-Large') }
    ];

    const backgrounds = [
        { name: 'none', label: t('None'), imageUrl: BlankBg },
        { name: 'standard', label: t('Standard'), imageUrl: Background1 },
        { name: 'winter', label: t('Winter'), imageUrl: Background2 }
    ];

    const settings: SettingsDetails = JSON.parse(user?.throneteki_settings || '{}');
    const [localBackground, setBackground] = useState(settings.background || 'standard');
    const [localCardSize, setCardSize] = useState(settings.cardSize || 'normal');
    const [customBg, setCustomBg] = useState<string | null | undefined>(null);
    const topRowRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        setBackground(settings.background || 'none');
        setCardSize(settings.cardSize || 'normal');
    }, [settings.background, settings.cardSize]);

    const [saveUser, { isLoading }] = useSaveUserMutation();

    if (!user) {
        return (
            <Alert variant={AlertType.Danger}>You need to be logged in to view your profile.</Alert>
        );
    }

    const initialValues: ExistingProfileDetails = {
        userId: user.sub,
        actionWindows: settings.actionWindows || defaultActionWindows,
        chooseOrder: !!settings.chooseOrder,
        chooseCards: !!settings.chooseCards,
        promptDupes: !!settings.promptDupes,
        windowTimer: settings.windowTimer || 10,
        timerAbilities: !!settings.timerAbilities,
        timerEvents: settings.timerEvents || true
    };

    return (
        <>
            {error && <Alert variant='danger'>{error}</Alert>}
            {success && <Alert variant='success'>{success}</Alert>}
            <Formik
                onSubmit={async (values: ExistingProfileDetails): Promise<void> => {
                    setError('');
                    setSuccess('');

                    const submitValues: NewProfileDetails = {
                        userId: user.sub,
                        settings: {
                            actionWindows: values.actionWindows,
                            chooseOrder: values.chooseOrder,
                            chooseCards: values.chooseCards,
                            promptDupes: values.promptDupes,
                            windowTimer: values.windowTimer,
                            timerAbilities: values.timerAbilities,
                            timerEvents: values.timerEvents
                        }
                    };

                    if (localBackground) {
                        submitValues.settings.background = localBackground;
                    }

                    if (localCardSize) {
                        submitValues.settings.cardSize = localCardSize;
                    }

                    if (customBg) {
                        submitValues.customBackground = customBg;
                    }

                    if (submitValues.settings.windowTimer > 10) {
                        submitValues.settings.windowTimer = 10;
                    }

                    try {
                        const response = await saveUser({
                            userId: user.sub,
                            userDetails: submitValues
                        }).unwrap();
                        if (!response.success) {
                            setError(response.message);
                        } else {
                            setSuccess(t('Settings saved successfully.'));
                        }
                    } catch (err) {
                        const apiError = err as ApiError;
                        setError(
                            t(
                                apiError.data.message ||
                                    'An error occured saving the settings. Please try again later.'
                            )
                        );
                    }

                    if (!topRowRef || !topRowRef.current) {
                        return;
                    }

                    topRowRef.current.scrollIntoView(false);
                }}
                initialValues={initialValues}
            >
                {(formProps: FormikProps<ExistingProfileDetails>): ReactElement => (
                    <form
                        className='profile-form'
                        onSubmit={(event: React.FormEvent<HTMLFormElement>): void => {
                            event.preventDefault();
                            formProps.handleSubmit(event);
                        }}
                    >
                        <div ref={topRowRef}>
                            <div>
                                <SettingsBackground
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
                            </div>
                        </div>
                        <div>
                            <div>
                                <ThronetekiGameSettings formProps={formProps} user={user} />
                            </div>
                        </div>
                        <div className='grid grid-cols-2'>
                            <div>
                                <SettingsCardSize
                                    cardSizes={cardSizes}
                                    selectedCardSize={localCardSize}
                                    onCardSizeSelected={(name): void => setCardSize(name)}
                                />
                            </div>
                            <div>
                                <SettingsActionWindows formProps={formProps} user={user} />
                            </div>
                        </div>
                        <div className='sticky bottom-5 z-50 bg-primary text-center'>
                            <Button color='success' type='submit' isLoading={isLoading}>
                                <Trans>Save</Trans>
                            </Button>
                        </div>
                    </form>
                )}
            </Formik>
        </>
    );
};

export default Settings;
