import React, { useEffect, useState } from 'react';
import { LogoutActions } from './AuthorisationConstants';
import { useAuth } from 'react-oidc-context';

// The main responsibility of this component is to handle the user's logout process.
// This is the starting point for the logout process, which is usually initiated when a
// user clicks on the logout button on the LoginMenu component.

interface LogoutProps {
    action: string;
}

export const Logout = (props: LogoutProps) => {
    const [message, setMessage] = useState<string | undefined>();
    const auth = useAuth();

    const { action } = props;

    useEffect(() => {
        const logout = async () => {
            const isauthenticated = auth.isAuthenticated;
            if (isauthenticated) {
                auth.signoutRedirect();
            } else {
                setMessage('You successfully logged out!');
            }
        };

        switch (action) {
            case LogoutActions.Logout:
                if (!!window.history.state.usr.local) {
                    logout();
                } else {
                    // This prevents regular links to <app>/authentication/logout from triggering a logout
                    setMessage('The logout was not initiated from within the page.');
                }
                break;
            case LogoutActions.LoggedOut:
                setMessage('You successfully logged out!');
                break;
            default:
                throw new Error(`Invalid action '${action}'`);
        }
    }, [action, auth]);

    if (!!message) {
        return <div>{message}</div>;
    } else {
        switch (action) {
            case LogoutActions.Logout:
                return <div>Processing logout</div>;
            case LogoutActions.LogoutCallback:
                return <div>Processing logout callback</div>;
            case LogoutActions.LoggedOut:
                return <div>{message}</div>;
            default:
                throw new Error(`Invalid action '${action}'`);
        }
    }
};
