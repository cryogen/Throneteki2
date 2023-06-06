import React, { useEffect, useRef } from 'react';
import { useLocation, useRoutes } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { useAuth } from 'react-oidc-context';
// import useBreadcrumbs from 'use-react-router-breadcrumbs';

import { useAppDispatch, useAppSelector } from './redux/hooks';
import Navigation from './components/Navigation/Navigation';
import AuthorisationRoutes from './authorisation/AuthorisationRoutes';
import routes from './routes';
import { lobbyActions } from './redux/slices/lobbySlice';
import { ThronetekiUser } from './types/user';
// import Breadcrumbs from './components/Site/Breadcrumbs';
import Background from './assets/img/bgs/mainbg.png';
import BlankBg from './assets/img/bgs/blank.png';
import StandardBg from './assets/img/bgs/background.png';
import WinterBg from './assets/img/bgs/background2.png';

function RouteElement() {
    const routeArray = routes();

    return useRoutes(routeArray.concat(AuthorisationRoutes()));
}

const backgrounds: { [key: string]: string } = {
    none: BlankBg,
    standard: StandardBg,
    winter: WinterBg
};

function App() {
    const dispatch = useAppDispatch();
    const auth = useAuth();
    const { currentGame: activeGame } = useAppSelector((state) => state.gameNode);
    const location = useLocation();
    const bgRef = useRef<HTMLDivElement>();
    // const breadcrumbs = useBreadcrumbs(routes());

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

    const user = auth.user?.profile as ThronetekiUser;

    const gameBoardVisible = activeGame?.started && location.pathname === '/play';

    if (gameBoardVisible && user) {
        const settings = JSON.parse(user.throneteki_settings);
        const background = settings.background;

        if (bgRef.current && background === 'custom' && settings.customBackgroundUrl) {
            bgRef.current.style.backgroundImage = `url('/img/bgs/${settings.customBackgroundUrl}')`;
        } else if (bgRef.current) {
            bgRef.current.style.backgroundImage = `url('${backgrounds[background]}')`;
        }
    } else if (bgRef.current) {
        bgRef.current.style.backgroundImage = `url('${Background}')`;
    }

    return (
        <div className='bg' ref={bgRef}>
            <Navigation />

            <main role='main'>
                <div className='wrapper'>
                    <Container className='content'>
                        {/*      <Breadcrumbs breadcrumbs={breadcrumbs} />*/}

                        <RouteElement />
                    </Container>
                </div>
            </main>
        </div>
    );
}

export default App;
