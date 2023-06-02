import React, { useEffect, useState } from 'react';
import { LoginActions, QueryParameterNames, ApplicationPaths } from './AuthorisationConstants';
import { useAuth } from 'react-oidc-context';
import LoadingSpinner from '../components/LoadingSpinner';

// The main responsibility of this component is to handle the user's login process.
// This is the starting point for the login process. Any component that needs to authenticate
// a user can simply perform a redirect to this component with a returnUrl query parameter and
// let the component perform the login and return back to the return url.

interface LoginProps {
    action: string;
}

export const Login = (props: LoginProps) => {
    const [message, setMessage] = useState<string | undefined | null>();
    const { action } = props;
    const auth = useAuth();

    const redirectToApiAuthorizationPath = (apiAuthorizationPath: string) => {
        const redirectUrl = `${window.location.origin}/${apiAuthorizationPath}`;
        // It's important that we do a replace here so that when the user hits the back arrow on the
        // browser they get sent back to where it was on the app instead of to an endpoint on this
        // component.
        window.location.replace(redirectUrl);
    };

    // const navigateToReturnUrl = (returnUrl: string) => {
    //     // It's important that we do a replace here so that we remove the callback uri with the
    //     // fragment containing the tokens from the browser history.
    //     window.location.replace(returnUrl);
    // };

    useEffect(() => {
        const login = async () => {
            if (!auth.isAuthenticated) {
                auth.signinRedirect();
            }
            // console.info('login');
            // const state = { returnUrl };
            // const result = await authService.signIn(state);
            // switch (result.status) {
            //     case AuthenticationResultStatus.Redirect:
            //         break;
            //     case AuthenticationResultStatus.Success:
            //         await navigateToReturnUrl(returnUrl);
            //         break;
            //     case AuthenticationResultStatus.Fail:
            //         setMessage(result.message);
            //         break;
            //     default:
            //         throw new Error(`Invalid status result ${result.status}.`);
            // }
        };

        const redirectToRegister = () => {
            redirectToApiAuthorizationPath(
                `${ApplicationPaths.IdentityRegisterPath}?${
                    QueryParameterNames.ReturnUrl
                }=${encodeURI(ApplicationPaths.Login)}`
            );
        };

        const redirectToProfile = () => {
            redirectToApiAuthorizationPath(ApplicationPaths.IdentityManagePath);
        };

        switch (action) {
            case LoginActions.Login:
                login();
                break;
            case LoginActions.LoginCallback:
                break;
            case LoginActions.LoginFailed:
                const params = new URLSearchParams(window.location.search);
                const error = params.get(QueryParameterNames.Message);
                setMessage(error);
                break;
            case LoginActions.Profile:
                redirectToProfile();
                break;
            case LoginActions.Register:
                redirectToRegister();
                break;
            default:
                throw new Error(`Invalid action '${action}'`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [action]);

    if (!!message) {
        return <div>{message}</div>;
    } else {
        switch (action) {
            case LoginActions.Login:
            case LoginActions.LoginCallback:
                return <LoadingSpinner text='Processing login' />;
            case LoginActions.Profile:
            case LoginActions.Register:
                return <div></div>;
            default:
                throw new Error(`Invalid action '${action}'`);
        }
    }
};
