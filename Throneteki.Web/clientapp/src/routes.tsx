import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from 'react-oidc-context';
import NotFound from './components/NotFound';
import { ApplicationPaths, QueryParameterNames } from './authorisation/AuthorisationConstants';
import LoginPage from './pages/Account/LoginPage';
import RegisterPage from './pages/Account/RegisterPage';
import ProfilePage from './pages/Account/ProfilePage';
import Lobby from './pages/Lobby';
import BlockListPage from './pages/Account/BlockListPage';

const Routes = () => {
    const location = useLocation();
    const auth = useAuth();

    const path = location.pathname;

    const link = document.createElement('a');
    link.href = path;
    const returnUrl = `${link.protocol}//${link.host}${link.pathname}${link.search}${link.hash}`;
    const redirectUrl = `${ApplicationPaths.Login}?${
        QueryParameterNames.ReturnUrl
    }=${encodeURIComponent(returnUrl)}`;

    return [
        { path: '/', element: <Lobby /> },
        {
            path: '/account/blocklist',
            element: auth.user && <BlockListPage />
        },
        { path: '/account/login', element: <LoginPage /> },
        { path: '/account/register', element: <RegisterPage /> },
        { path: '/account/profile', element: auth.user && <ProfilePage /> },
        { path: '*', element: <NotFound /> }
    ];
};

export default Routes;
