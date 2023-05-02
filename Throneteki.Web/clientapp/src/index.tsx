import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from 'react-oidc-context';
import { WebStorageStateStore } from 'oidc-client-ts';

import { store } from './redux/store';
import App from './App';
import reportWebVitals from './reportWebVitals';

import './i18n';
import './custom.scss';

const oidcConfig = {
    authority: 'https://localhost:7000/',
    redirect_uri: 'http://localhost:44460/authentication/login-callback',
    silent_redirect_uri: 'http://localhost:44460/authentication/login-callback',
    client_id: 'throneteki',
    scope: 'openid api email profile roles offline_access lobby',
    loadUserInfo: true,
    onSigninCallback: (): void => {
        window.history.replaceState({}, document.title, window.location.pathname);
        window.location.replace('/');
    },
    userStore: new WebStorageStateStore({ store: window.localStorage })
};

function AppWrapper() {
    return (
        <Provider store={store}>
            <Router>
                <AuthProvider {...oidcConfig}>
                    <App />
                </AuthProvider>
            </Router>{' '}
        </Provider>
    );
}

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<AppWrapper />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

reportWebVitals();
