import React, { useEffect } from 'react';
import { useRoutes } from 'react-router-dom';
import { Container } from 'react-bootstrap';

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

    useEffect(() => {
        dispatch(lobbyActions.startConnecting());

        return () => {
            dispatch(lobbyActions.disconnect());
        };
    }, [dispatch]);

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
