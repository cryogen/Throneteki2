import React, { useEffect } from 'react';
import { useRoutes } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { useAuth } from 'react-oidc-context';

import { useAppDispatch } from './redux/hooks';
import Navigation from './components/Navigation/Navigation';
import AuthorisationRoutes from './authorisation/AuthorisationRoutes';
import routes from './routes';
import { lobbyActions } from './redux/slices/lobby';

function RouteElement() {
    const routeArray = routes();

    return useRoutes(routeArray.concat(AuthorisationRoutes()));
}

function App() {
    const dispatch = useAppDispatch();
    const auth = useAuth();

    useEffect(() => {
        const checkAuth = async () => {
            await auth.clearStaleState();

            try {
                if (auth.user) {
                    await auth.signinSilent();
                }
            } catch (err) {
                auth.signoutRedirect();
            }
        };

        checkAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        dispatch(lobbyActions.startConnecting());

        return () => {
            dispatch(lobbyActions.disconnect());
        };
    }, [dispatch]);

    useEffect(() => {
        // the `return` is important - addAccessTokenExpiring() returns a cleanup function
        return auth.events.addAccessTokenExpiring(() => {
            auth.signinSilent();
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth.events, auth.signinSilent]);

    return (
        <>
            <Navigation appName='The Iron Throne' />

            <main role='main'>
                <Container className='content'>
                    <RouteElement />
                </Container>
            </main>
        </>
    );
}

export default App;
