import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router';
import Home from './components/Home';
import NotFound from './components/NotFound';
import { ApplicationPaths, QueryParameterNames } from './authorisation/AuthorisationConstants';
import LoginPage from './pages/Account/LoginPage';
import RegisterPage from './pages/Account/RegisterPage';
import ProfilePage from './pages/Account/ProfilePage';
import { useAuth } from 'react-oidc-context';

const Routes = () => {
    const location = useLocation();
    const auth = useAuth();

    const path = location.pathname;

    useEffect(() => {
        // const subscription = authService.subscribe(() => authenticationChanged());
        // return () => {
        //     authService.unsubscribe(subscription);
        // };
    });

    const link = document.createElement('a');
    link.href = path;
    const returnUrl = `${link.protocol}//${link.host}${link.pathname}${link.search}${link.hash}`;
    const redirectUrl = `${ApplicationPaths.Login}?${
        QueryParameterNames.ReturnUrl
    }=${encodeURIComponent(returnUrl)}`;

    return [
        { path: '/', element: auth.isAuthenticated ? <Home /> : <Navigate to={redirectUrl} /> },
        { path: '/account/login', element: <LoginPage /> },
        { path: '/account/register', element: <RegisterPage /> },
        { path: '/account/profile', element: <ProfilePage /> },
        { path: '*', element: <NotFound /> }
    ];
};

export default Routes;
