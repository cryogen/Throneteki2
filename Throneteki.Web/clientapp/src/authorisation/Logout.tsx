import React, { useEffect, useState } from 'react';
import authService, { AuthState } from './AuthoriseService';
import { AuthenticationResultStatus } from './AuthoriseService';
import { QueryParameterNames, LogoutActions, ApplicationPaths } from './AuthorisationConstants';
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

    const getReturnUrl = (state?: AuthState) => {
        const params = new URLSearchParams(window.location.search);
        const fromQuery = params.get(QueryParameterNames.ReturnUrl);
        if (fromQuery && !fromQuery.startsWith(`${window.location.origin}/`)) {
            // This is an extra check to prevent open redirects.
            throw new Error(
                'Invalid return url. The return url needs to have the same origin as the current page.'
            );
        }
        return (
            (state && state.returnUrl) ||
            fromQuery ||
            `${window.location.origin}${ApplicationPaths.LoggedOut}`
        );
    };

    const navigateToReturnUrl = (returnUrl: string) => {
        return window.location.replace(returnUrl);
    };

    useEffect(() => {
        const logout = async (returnUrl: string) => {
            const state = { returnUrl };
            const isauthenticated = auth.isAuthenticated;
            if (isauthenticated) {
                auth.signoutRedirect();
            } else {
                setMessage('You successfully logged out!');
            }
        };

        const processLogoutCallback = async () => {
            const url = window.location.href;
            const result = await authService.completeSignOut(url);
            switch (result.status) {
                case AuthenticationResultStatus.Redirect:
                    // There should not be any redirects as the only time completeAuthentication finishes
                    // is when we are doing a redirect sign in flow.
                    throw new Error('Should not redirect.');
                case AuthenticationResultStatus.Success:
                    await navigateToReturnUrl(getReturnUrl(result.state));
                    break;
                case AuthenticationResultStatus.Fail:
                    setMessage(result.message);
                    break;
                default:
                    throw new Error('Invalid authentication result status.');
            }
        };

        switch (action) {
            case LogoutActions.Logout:
                if (!!window.history.state.usr.local) {
                    logout(getReturnUrl());
                } else {
                    // This prevents regular links to <app>/authentication/logout from triggering a logout
                    setMessage('The logout was not initiated from within the page.');
                }
                break;
            case LogoutActions.LogoutCallback:
                processLogoutCallback();
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
