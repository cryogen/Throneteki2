import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import Home from './components/Home';
import NotFound from './components/NotFound';
import authService from './authorisation/AuthoriseService';
import { ApplicationPaths, QueryParameterNames } from './authorisation/AuthorisationConstants';
import LoginPage from './pages/Account/LoginPage';
import RegisterPage from './pages/Account/RegisterPage';
import ProfilePage from './pages/Account/ProfilePage';

const Routes = () => {
    const location = useLocation();
    const [ready, setReady] = useState(false);
    const [authenticated, setAuthenticated] = useState(false);

    const path = location.pathname;

    const populateAuthenticationState = async () => {
        const authenticated = await authService.isAuthenticated();

        setReady(true);
        setAuthenticated(authenticated);
    };

    const authenticationChanged = async () => {
        setReady(false);
        setAuthenticated(false);

        await populateAuthenticationState();
    };

    useEffect(() => {
        const subscription = authService.subscribe(() => authenticationChanged());

        populateAuthenticationState();

        return () => {
            authService.unsubscribe(subscription);
        };
    });

    const link = document.createElement('a');
    link.href = path;
    const returnUrl = `${link.protocol}//${link.host}${link.pathname}${link.search}${link.hash}`;
    const redirectUrl = `${ApplicationPaths.Login}?${
        QueryParameterNames.ReturnUrl
    }=${encodeURIComponent(returnUrl)}`;

    if (!ready) {
        return [];
    }

    return [
        { path: '/', element: authenticated ? <Home /> : <Navigate to={redirectUrl} /> },
        { path: '/account/login', element: <LoginPage /> },
        { path: '/account/register', element: <RegisterPage /> },
        { path: '/account/profile', element: <ProfilePage /> },
        { path: '*', element: <NotFound /> }
    ];
};

export default Routes;
