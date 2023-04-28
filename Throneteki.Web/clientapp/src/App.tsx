import React, { useEffect } from 'react';
import { useRoutes } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { useAuth } from 'react-oidc-context';
import useBreadcrumbs from 'use-react-router-breadcrumbs';

import { useAppDispatch } from './redux/hooks';
import Navigation from './components/Navigation/Navigation';
import AuthorisationRoutes from './authorisation/AuthorisationRoutes';
import routes from './routes';
import { lobbyActions } from './redux/slices/lobbySlice';
import Breadcrumbs from './components/Site/Breadcrumbs';

function RouteElement() {
    const routeArray = routes();

    return useRoutes(routeArray.concat(AuthorisationRoutes()));
}

function App() {
    const dispatch = useAppDispatch();
    const auth = useAuth();
    const breadcrumbs = useBreadcrumbs(routes());

    useEffect(() => {
        const checkAuth = async () => {
            console.info('clearing auth state');
            await auth.clearStaleState();

            try {
                if (!auth.isLoading && !auth.isAuthenticated && auth.user) {
                    console.info('found a user, signing in');
                    const ret = await auth.signinSilent();

                    console.info('response', ret);
                } else {
                    console.info('no user, not redirecting', auth.isLoading);
                }
            } catch (err) {
                console.info('auth error', err);
                auth.signoutRedirect();
            }
        };

        checkAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth.isLoading]);

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
                <div className='wrapper'>
                    <Container className='content'>
                        <Breadcrumbs breadcrumbs={breadcrumbs} />

                        <RouteElement />
                    </Container>
                </div>
            </main>
        </>
    );
}

export default App;
