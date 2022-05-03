import React from 'react';
import { useRoutes } from 'react-router-dom';
import { Container } from 'react-bootstrap';

import Navigation from './components/Navigation/Navigation';
import AuthorisationRoutes from './authorisation/AuthorisationRoutes';
import routes from './routes';

import './App.css';

function RouteElement() {
    const routeArray = routes();

    return useRoutes(routeArray.concat(AuthorisationRoutes()));
}

function App() {
    return (
        <>
            <Navigation appName='The Iron Throne' user={undefined} />

            <main role='main'>
                <Container className='content'>
                    <RouteElement />
                </Container>
            </main>
        </>
    );
}

export default App;
