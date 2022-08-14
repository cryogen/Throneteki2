import React from 'react';
import { useAuth } from 'react-oidc-context';
import NotFound from './components/NotFound';
import LoginPage from './pages/Account/LoginPage';
import RegisterPage from './pages/Account/RegisterPage';
import ProfilePage from './pages/Account/ProfilePage';
import Lobby from './pages/Lobby';
import BlockListPage from './pages/Account/BlockListPage';
import DecksPage from './pages/Decks/DecksPage';
import ImportDeckPage from './pages/Decks/ImportDeckPage';
import ThronesDbDecksPage from './pages/Decks/ThronesDbDecksPage';
import DeckPage from './pages/Decks/DeckPage';
import NewDeckPage from './pages/Decks/NewDeckPage';

const Routes = () => {
    // const location = useLocation();
    const auth = useAuth();

    // const path = location.pathname;

    // const link = document.createElement('a');
    // link.href = path;
    // const returnUrl = `${link.protocol}//${link.host}${link.pathname}${link.search}${link.hash}`;
    // const redirectUrl = `${ApplicationPaths.Login}?${
    //     QueryParameterNames.ReturnUrl
    // }=${encodeURIComponent(returnUrl)}`;

    return [
        { path: '/', element: <Lobby />, breadcrumb: 'Home' },
        {
            path: '/account/blocklist',
            element: auth.user && <BlockListPage />
        },
        { path: '/account/login', element: <LoginPage /> },
        { path: '/account/register', element: <RegisterPage /> },
        { path: '/account/profile', element: auth.user && <ProfilePage /> },
        { path: '/decks', element: auth.user && <DecksPage /> },
        { path: '/decks/new', element: auth.user && <NewDeckPage /> },
        { path: '/decks/:deckId', element: auth.user && <DeckPage /> },
        { path: '/decks/import', element: auth.user && <ImportDeckPage /> },
        { path: '/decks/thronesdb', element: auth.user && <ThronesDbDecksPage /> },
        { path: '*', element: <NotFound /> }
    ];
};

export default Routes;
