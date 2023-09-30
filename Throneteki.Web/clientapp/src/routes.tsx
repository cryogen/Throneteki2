import { useAuth } from 'react-oidc-context';
import NotFound from './components/NotFound';
import LoginPage from './pages/account/LoginPage';
import SettingsPage from './pages/account/SettingsPage';
import Lobby from './pages/Lobby';
import BlockListPage from './pages/account/BlockListPage';
import DecksPage from './pages/decks/DecksPage';
import ImportDeckPage from './pages/decks/ImportDeckPage';
import ThronesDbDecksPage from './pages/decks/ThronesDbDecksPage';
import DeckPage from './pages/decks/DeckPage';
import NewDeckPage from './pages/decks/NewDeckPage';
import ProfilePage from './pages/account/ProfilePage';
import UserAdminPage from './pages/admin/UserAdminPage';
import PlayPage from './pages/PlayPage';
import EditDeckPage from './pages/decks/EditDeckPage';

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
        { path: '/account/profile', element: auth.user && <ProfilePage /> },
        { path: '/account/settings', element: auth.user && <SettingsPage /> },
        { path: '/admin/users', element: auth.user && <UserAdminPage /> },
        { path: '/decks', element: auth.user && <DecksPage /> },
        { path: '/decks/new', element: auth.user && <NewDeckPage /> },
        { path: '/decks/:deckId', element: auth.user && <DeckPage /> },
        { path: '/decks/:deckId/edit', element: auth.user && <EditDeckPage /> },
        { path: '/decks/import', element: auth.user && <ImportDeckPage /> },
        { path: '/decks/thronesdb', element: auth.user && <ThronesDbDecksPage /> },
        { path: '/play', element: <PlayPage /> },
        { path: '*', element: <NotFound /> }
    ];
};

export default Routes;
