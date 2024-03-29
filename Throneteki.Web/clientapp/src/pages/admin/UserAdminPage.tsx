import { useEffect, useState } from 'react';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from 'react-oidc-context';
import { Formik } from 'formik';
import { Trans, useTranslation } from 'react-i18next';

import * as yup from 'yup';

import {
    ApiError,
    useLazyGetUserDetailsQuery,
    useSaveUserAdminMutation
} from '../../redux/api/apiSlice';
import Panel from '../../components/site/Panel';
import { Permission } from '../../components/navigation/menus';
import { ThronetekiUser } from '../../types/user';
import { Button, Input, Switch, Table } from '@nextui-org/react';
import Alert from '../../components/site/Alert';

const defaultPermissions = {
    canEditNews: false,
    canManageUsers: false,
    canManagePermissions: false,
    canManageGames: false,
    canManageNodes: false,
    canModerateChat: false,
    canVerifyDecks: false,
    canManageBanlist: false,
    canManageMotd: false,
    canManageTournaments: false,
    isAdmin: false,
    isContributor: false,
    isSupporter: false,
    isWinner: false,
    isPreviousWinner: false
};

const permissions = [
    { name: 'NewsManager', label: 'News Editor' },
    { name: 'UserManager', label: 'User Manager' },
    { name: 'PermissionsManager', label: 'Permissions Manager' },
    { name: 'GameManager', label: 'Games Manager' },
    { name: 'NodeManager', label: 'Node Manager' },
    { name: 'ChatManager', label: 'Chat Moderator' },
    { name: 'BanListManager', label: 'Banlist Manager' },
    { name: 'MotdManager', label: 'Motd Manager' },
    { name: 'Admin', label: 'Site Admin' },
    { name: 'Contributor', label: 'Contributor' },
    { name: 'Supporter', label: 'Supporter' },
    { name: 'Winner', label: 'Tournament Winner' },
    { name: 'PreviousWinner', label: 'Previous Tournament Winner' },
    {
        name: 'SupporterWithNoPatreon',
        label: "Don't remove supporter when patreon expires/unlinks"
    }
];

const UserAdminPage = () => {
    const { t } = useTranslation();
    const auth = useAuth();

    const [fetchUser, { isLoading, isError, data: currentUser, error }] =
        useLazyGetUserDetailsQuery();
    const [saveUserAdmin, { isLoading: isSaveLoading }] = useSaveUserAdminMutation();

    const [currentPermissions, setCurrentPermissions] = useState(
        currentUser?.permissions || defaultPermissions
    );
    const [userVerified, setUserVerified] = useState(currentUser?.verified);
    const [userDisabled, setUserDisabled] = useState(currentUser?.disabled);
    const [errorMessage, setErrorMessage] = useState('');

    const user = auth.user?.profile as ThronetekiUser;

    useEffect(() => {
        if (currentUser) {
            setCurrentPermissions(currentUser.permissions);
            setUserDisabled(currentUser.disabled);
            setUserVerified(currentUser.verified);
        }
    }, [currentUser]);

    const initialValues = {
        username: '',
        disabled: !!currentUser?.disabled,
        verified: !!currentUser?.verified
    };

    const schema = yup.object({
        username: yup.string().required('Username must be specified')
    });

    let permissionsCheckBoxes: JSX.Element[];

    if (currentUser) {
        permissionsCheckBoxes = permissions.map((permission) => {
            return (
                <div key={`permissions.${permission.name}`}>
                    <Switch
                        id={`permissions.${permission.name}`}
                        onChange={() => {
                            const newPermissions = Object.assign({}, currentPermissions);

                            newPermissions[permission.name] = !currentPermissions[permission.name];
                            setCurrentPermissions(newPermissions);
                        }}
                        value='true'
                        isSelected={!!currentPermissions[permission.name]}
                    >
                        {permission.label}
                    </Switch>
                </div>
            );
        });
    }

    useEffect(() => {
        if (isError) {
            if ((error as ApiError).status === 404) {
                setErrorMessage('User not found.');
            } else {
                setErrorMessage('An error occurred looking up the user, please try again later.');
            }
        }
    }, [isError, error]);

    return (
        <div>
            <Formik
                validationSchema={schema}
                onSubmit={async (values) => {
                    setErrorMessage('');
                    fetchUser(values.username);
                }}
                initialValues={initialValues}
            >
                {(formProps) => (
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            formProps.handleSubmit(event);
                        }}
                    >
                        <Panel title='User administration'>
                            {errorMessage && <Alert variant='danger'>{errorMessage}</Alert>}
                            <div>
                                <Input
                                    type='text'
                                    label={t('Username')}
                                    placeholder={t('Enter a username')}
                                    isInvalid={
                                        formProps.touched.username && !!formProps.errors.username
                                    }
                                    {...formProps.getFieldProps('username')}
                                    errorMessage={formProps.errors.username}
                                />
                            </div>
                            <div>
                                <div className='mt-2'>
                                    <Button type='submit' color='primary'>
                                        <Trans>Search</Trans>
                                        {isLoading && <FontAwesomeIcon icon={faCircleNotch} spin />}
                                    </Button>
                                </div>
                            </div>
                        </Panel>
                        {currentUser && (
                            <>
                                <Panel
                                    title={`${currentUser.username} - User details`}
                                    className='mt-3'
                                >
                                    <dl>
                                        <div>
                                            <div>
                                                <dt>Username:</dt>
                                            </div>
                                            <div>
                                                <dd>{currentUser.username}</dd>
                                            </div>
                                        </div>
                                        <div>
                                            <div>
                                                <dt>Email:</dt>
                                            </div>
                                            <div>
                                                <dd>{currentUser.email}</dd>
                                            </div>
                                        </div>
                                        <div>
                                            <div>
                                                <dt>Registered:</dt>
                                            </div>
                                            <div>
                                                <dd>
                                                    {moment(currentUser.registered).format(
                                                        'YYYY-MM-DD HH:MM'
                                                    )}
                                                </dd>
                                            </div>
                                        </div>
                                    </dl>

                                    <Switch
                                        id='disabled'
                                        onChange={() => setUserDisabled(!userDisabled)}
                                        isSelected={userDisabled}
                                    >
                                        {'Disabled'}
                                    </Switch>
                                    <Switch
                                        id='verified'
                                        onChange={() => setUserVerified(!userVerified)}
                                        isSelected={userVerified}
                                    >
                                        {'Verified'}
                                    </Switch>
                                </Panel>
                                {currentUser.linkedAccounts && (
                                    <Panel title='Possibly linked accounts'>
                                        <ul className='list'>
                                            {currentUser.linkedAccounts.map((name: string) => {
                                                return (
                                                    <li key={name}>
                                                        <a
                                                            href='javascript:void(0)'
                                                            onClick={() => fetchUser(name)}
                                                        >
                                                            {name}
                                                        </a>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </Panel>
                                )}
                                {currentUser.tokens && (
                                    <Panel title='Sessions' className='mt-3'>
                                        <Table isStriped>
                                            <thead>
                                                <tr>
                                                    <th>IP Address</th>
                                                    <th>Last Used</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                    currentUser.tokens.map((token: any) => {
                                                        return (
                                                            <tr key={token.ip}>
                                                                <td>{token.ip}</td>
                                                                <td>
                                                                    {moment(token.lastUsed).format(
                                                                        'YYYY-MM-DD HH:MM'
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                }
                                            </tbody>
                                        </Table>
                                    </Panel>
                                )}
                                {user.role.includes(Permission.CanManagePermissions) ? (
                                    <Panel title='Permissions' className='mt-3'>
                                        <div>{permissionsCheckBoxes}</div>
                                    </Panel>
                                ) : null}
                                <div className='mt-3 text-center'>
                                    <Button
                                        type='button'
                                        className='btn btn-primary me-2'
                                        // onClick={() =>
                                        //     dispatch(clearUserSessions(currentUser.username))
                                        // }
                                    >
                                        Clear sessions
                                    </Button>
                                    <Button
                                        type='button'
                                        color='primary'
                                        onClick={async () => {
                                            const saveUser = Object.assign({}, currentUser);
                                            saveUser.permissions = currentPermissions;
                                            saveUser.verified = userVerified;
                                            saveUser.disabled = userDisabled;

                                            try {
                                                const response = await saveUserAdmin({
                                                    userId: saveUser.id,
                                                    userDetails: saveUser
                                                }).unwrap();

                                                if (!response.success) {
                                                    setErrorMessage(response.message);
                                                }
                                            } catch (err) {
                                                const apiError = err as ApiError;
                                                setErrorMessage(
                                                    t(
                                                        apiError.data.message ||
                                                            'An error occured saving the user details. Please try again later.'
                                                    )
                                                );
                                            }
                                        }}
                                    >
                                        Save&nbsp;
                                        {isSaveLoading && (
                                            <FontAwesomeIcon icon={faCircleNotch} spin />
                                        )}
                                    </Button>
                                </div>
                            </>
                        )}
                    </form>
                )}
            </Formik>
        </div>
    );
};

UserAdminPage.displayName = 'UserAdmin';

export default UserAdminPage;
