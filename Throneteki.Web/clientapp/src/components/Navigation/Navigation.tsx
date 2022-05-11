import React, { useEffect, useState } from 'react';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { RightMenu, /* ProfileMenu,*/ LeftMenu, MenuItem, ProfileMenu } from './menus';
// import LanguageSelector from './LanguageSelector';
import ProfileDropdown from './ProfileMenu';
// import ServerStatus from './ServerStatus';
// import GameContextMenu from './GameContextMenu';

import './Navigation.scss';
import authService from '../../authorisation/AuthoriseService';
import { Profile } from 'oidc-client';

interface NavigationProps {
    appName: string;
}

/**
 * @param {NavigationProps} props
 */
const Navigation = (props: NavigationProps) => {
    const { t } = useTranslation();
    const [user, setUser] = useState<Profile | null | undefined>(null);

    // const { games, currentGame, lobbyResponse, lobbySocketConnected, lobbySocketConnecting } =
    //     useSelector((state) => ({
    //         games: state.lobby.games,
    //         currentGame: state.lobby.currentGame,
    //         lobbyResponse: state.lobby.responseTime,
    //         lobbySocketConnected: state.lobby.connected,
    //         lobbySocketConnecting: state.lobby.connecting
    //     }));
    // const { gameConnected, gameConnecting, gameResponse } = useSelector((state) => ({
    //     gameConnected: state.games.connected,
    //     gameConnecting: state.games.connecting,
    //     gameResponse: state.games.responseTime
    // }));

    const getUser = async () => {
        setUser(await authService.getUser());
    };

    useEffect(() => {
        getUser();
    }, []);

    const userCanSeeMenu = (menuItem: MenuItem, user: Profile | null | undefined) => {
        return !menuItem.permission || user?.role?.includes(menuItem.permission);
    };

    /**
     * Filter a list of menu items to what the logged in user can see
     * @param {MenuItem[]} menuItems The list of menu items
     * @param {User} user The logged in user
     * @returns {MenuItem[]} The filtered menu items
     */
    const filterMenuItems = (menuItems: MenuItem[], user: Profile | null | undefined) => {
        const returnedItems = [];

        for (const menuItem of menuItems) {
            if (user && menuItem.showOnlyWhenLoggedOut) {
                continue;
            }

            if (!user && menuItem.showOnlyWhenLoggedIn) {
                continue;
            }

            if (!userCanSeeMenu(menuItem, user)) {
                continue;
            }

            returnedItems.push(menuItem);
        }

        return returnedItems;
    };

    /**
     * Render a list of menu items to react components
     * @param {MenuItem[]} menuItems The menu items
     * @returns {JSX.Element[]} The list of rendered menu items
     */
    const renderMenuItems = (menuItems: MenuItem[]) => {
        return filterMenuItems(menuItems, user).map((menuItem) => {
            const children = menuItem.childItems && filterMenuItems(menuItem.childItems, user);
            if (children && children.length > 0) {
                return (
                    <NavDropdown
                        key={menuItem.title}
                        title={t(menuItem.title)}
                        id={`nav-${menuItem.title}`}
                    >
                        {children.map((menuItem) => {
                            if (!menuItem.path) {
                                return <></>;
                            }

                            return (
                                <NavDropdown.Item key={menuItem.path} as={Link} to={menuItem.path}>
                                    {t(menuItem.title)}
                                </NavDropdown.Item>
                            );
                        })}
                    </NavDropdown>
                );
            }

            if (!menuItem.path) {
                return <></>;
            }

            return (
                <Nav.Link key={menuItem.path || menuItem.title} as={Link} to={menuItem.path}>
                    {menuItem.title}
                </Nav.Link>
            );
        });
    };

    // const numGames = (
    //     <li>
    //         <span>{t('{{gameLength}} Games', { gameLength: games?.length })}</span>
    //     </li>
    // );

    return (
        <Navbar bg='dark' variant='dark' className='navbar-sm' fixed='top'>
            <Container>
                <Navbar.Brand as={Link} to='/'>
                    {props.appName}
                </Navbar.Brand>
                <Navbar.Toggle aria-controls='navbar' />
                <Nav>{renderMenuItems(LeftMenu)}</Nav>
                <Navbar.Collapse id='navbar' className='justify-content-end'>
                    <Nav className='ml-auto pr-md-5'>
                        {/* <GameContextMenu />
                    {numGames}
                    {!currentGame && (
                        <ServerStatus
                            connected={lobbySocketConnected}
                            connecting={lobbySocketConnecting}
                            serverType='Lobby'
                            responseTime={lobbyResponse}
                        />
                    )}
                    {currentGame?.started && (
                        <ServerStatus
                            connected={gameConnected}
                            connecting={gameConnecting}
                            serverType='Game server'
                            responseTime={gameResponse}
                        />
                    )} */}
                        {renderMenuItems(RightMenu)}
                        <ProfileDropdown menu={ProfileMenu} user={user} />
                        {/* <LanguageSelector /> */}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Navigation;
