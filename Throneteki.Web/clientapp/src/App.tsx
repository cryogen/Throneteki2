import { useLocation, useRoutes } from 'react-router-dom';
import Navigation from './components/navigation/Navigation';

import routes from './routes';
import Background from './assets/img/bgs/mainbg.png';
import BlankBg from './assets/img/bgs/blank.png';
import StandardBg from './assets/img/bgs/background.png';
import WinterBg from './assets/img/bgs/background2.png';
import { useAuth } from 'react-oidc-context';
import { useEffect, useRef } from 'react';
import { ThronetekiUser } from './types/user';
import { lobbyActions } from './redux/slices/lobbySlice';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import LoadingSpinner from './components/LoadingSpinner';

const RouteElement = () => {
    const routeArray = routes();

    return useRoutes(routeArray);
};

const backgrounds: { [key: string]: string } = {
    none: BlankBg,
    standard: StandardBg,
    winter: WinterBg
};

const App = () => {
    const dispatch = useAppDispatch();
    const auth = useAuth();
    const { currentGame: activeGame } = useAppSelector((state) => state.gameNode);
    const location = useLocation();
    const bgRef = useRef<HTMLDivElement>();

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
            console.info('auth token is expiring');
            auth.signinSilent();
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth.events, auth.signinSilent]);

    const user = auth.user?.profile as ThronetekiUser;
    const gameBoardVisible = activeGame?.started && location.pathname === '/play';

    useEffect(() => {
        if (gameBoardVisible && user) {
            const settings = user.throneteki_settings ? JSON.parse(user.throneteki_settings) : {};
            const background = settings.background;

            if (bgRef.current && background === 'custom' && settings.customBackgroundUrl) {
                bgRef.current.style.backgroundImage = `url('/img/bgs/${settings.customBackgroundUrl}')`;
            } else if (bgRef.current) {
                bgRef.current.style.backgroundImage = `url('${backgrounds[background]}')`;
            }
        } else if (bgRef.current) {
            bgRef.current.style.backgroundImage = `url('${Background}')`;
        }
    });

    if (auth.isLoading) {
        return <LoadingSpinner text='Checking authentication status, please wait...' />;
    }

    return (
        <div>
            <Navigation />

            <main role='main'>
                <div
                    className='absolute bottom-0 left-0 right-0 top-12 bg-cover bg-center bg-no-repeat'
                    ref={bgRef}
                >
                    {/*      <Breadcrumbs breadcrumbs={breadcrumbs} />*/}
                    {activeGame ? (
                        <RouteElement />
                    ) : (
                        <div className='container mt-4'>
                            <RouteElement />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;
