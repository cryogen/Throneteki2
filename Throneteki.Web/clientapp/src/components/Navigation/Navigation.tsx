import React from 'react';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

import { useAppSelector } from '../../redux/hooks';
import { RightMenu, LeftMenu, MenuItem, ProfileMenu } from './menus';
// import LanguageSelector from './LanguageSelector';
import ProfileDropdown from './ProfileMenu';
import ServerStatus from './ServerStatus';
import { CustomUserProfile } from '../../types/user';
// import GameContextMenu from './GameContextMenu';

export interface UserSettings {
    customBackground: string | undefined;
    background: string;
}

interface NavigationProps {
    appName: string;
}

/**
 * @param {NavigationProps} props
 */
const Navigation = (props: NavigationProps) => {
    const { t } = useTranslation();
    const auth = useAuth();
    const {
        isConnected: lobbyConnected,
        isEstablishingConnection: lobbyConnecting,
        responseTime: lobbyResponseTime,
        games
    } = useAppSelector((state) => state.lobby);
    const {
        isConnected: gameConnected,
        isEstablishingConnection: gameConnecting,
        responseTime: gameResponseTime,
        currentGame: activeGame
    } = useAppSelector((state) => state.gameNode);

    const user = auth.user?.profile as CustomUserProfile;

    const userCanSeeMenu = (menuItem: MenuItem, user: CustomUserProfile | null | undefined) => {
        return !menuItem.permission || user?.role?.includes(menuItem.permission);
    };

    const filterMenuItems = (menuItems: MenuItem[], user: CustomUserProfile | null | undefined) => {
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
                return <React.Fragment key={menuItem.title}></React.Fragment>;
            }

            return (
                <Nav.Link key={menuItem.path} as={Link} to={menuItem.path}>
                    {menuItem.title}
                </Nav.Link>
            );
        });
    };

    const numGames = (
        <li>
            <span>{t('{{gameLength}} Games', { gameLength: games?.length })}</span>
        </li>
    );

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
                        {
                            /* <GameContextMenu />*/
                            numGames
                        }

                        <ServerStatus
                            connected={lobbyConnected}
                            connecting={lobbyConnecting}
                            serverType='Lobby'
                            responseTime={lobbyResponseTime}
                        />
                        {activeGame && (
                            <ServerStatus
                                connected={gameConnected}
                                connecting={gameConnecting}
                                serverType='Game server'
                                responseTime={gameResponseTime}
                            />
                        )}
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
