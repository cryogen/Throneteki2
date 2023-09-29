import React from 'react';
import ReactDOM from 'react-dom/client';
import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { BrowserRouter as Router } from 'react-router-dom';
import { WebStorageStateStore } from 'oidc-client-ts';
import { AuthProvider } from 'react-oidc-context';
import ReduxToastr from 'react-redux-toastr';
import { Provider } from 'react-redux';
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';

import { store } from './redux/store';
import App from './App.tsx';

import './i18n';
import './index.css';
import 'react-redux-toastr/lib/css/react-redux-toastr.min.css';

const oidcConfig = {
    authority: `${import.meta.env.VITE_AUTH_URL}`,
    redirect_uri: `${import.meta.env.VITE_WEB_URL}/authentication/login-callback`,
    silent_redirect_uri: `${import.meta.env.VITE_WEB_URL}/authentication/login-callback`,
    client_id: `${import.meta.env.VITE_CLIENT_ID}`,
    scope: 'openid api email profile roles offline_access lobby',
    loadUserInfo: true,
    onSigninCallback: (): void => {
        window.history.replaceState({}, document.title, window.location.pathname);
        window.location.replace('/');
    },
    userStore: new WebStorageStateStore({ store: window.localStorage })
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Provider store={store}>
            <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
                <NextUIProvider>
                    <NextThemesProvider attribute='class' defaultTheme='dark'>
                        <Router>
                            <AuthProvider {...oidcConfig}>
                                <ReduxToastr
                                    timeOut={4000}
                                    newestOnTop
                                    preventDuplicates
                                    position='top-right'
                                    transitionIn='fadeIn'
                                    transitionOut='fadeOut'
                                />
                                <App />
                            </AuthProvider>
                        </Router>
                    </NextThemesProvider>
                </NextUIProvider>
            </DndProvider>
        </Provider>
    </React.StrictMode>
);
