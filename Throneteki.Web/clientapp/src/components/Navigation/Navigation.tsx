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
import { ThronetekiUser } from '../../types/user';
import GameContextMenu from './GameContextMenu';

import HeaderIcon from '../../assets/img/header_icon.png';
export interface UserSettings {
    customBackground: string | undefined;
    background: string;
}

const Navigation = () => {
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

    const user = auth.user?.profile as ThronetekiUser;

    const userCanSeeMenu = (menuItem: MenuItem, user: ThronetekiUser | null | undefined) => {
        return !menuItem.permission || user?.role?.includes(menuItem.permission);
    };

    const filterMenuItems = (menuItems: MenuItem[], user: ThronetekiUser | null | undefined) => {
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
        <Navbar bg='dark' variant='dark' className='navbar-sm' fixed='top' expand='md'>
            <Container>
                <Navbar.Toggle aria-controls='navbar' />
                <Navbar.Collapse id='navbar'>
                    <Navbar.Brand className='navbar-brand bg-dark' as={Link} to='/'>
                        <img
                            src={HeaderIcon}
                            width='32'
                            height='32'
                            className='d-inline-block align-top'
                            alt='The Iron Throne Logo'
                        />
                    </Navbar.Brand>

                    <Nav className='me-auto mb-2 mb-lg-0 bg-dark'>{renderMenuItems(LeftMenu)}</Nav>

                    <Nav className='ml-auto pr-md-5 bg-dark'>
                        <GameContextMenu />
                        {numGames}
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
