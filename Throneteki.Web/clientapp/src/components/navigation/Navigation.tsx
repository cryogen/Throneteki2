import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { useTheme } from 'next-themes';

import { useAppSelector } from '../../redux/hooks';
import { RightMenu, LeftMenu, MenuItem, ProfileMenu } from './menus';
import {
    Image,
    Link,
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarMenu,
    NavbarMenuItem,
    NavbarMenuToggle
} from '@nextui-org/react';
// import LanguageSelector from './LanguageSelector';
// import ProfileDropdown from './ProfileMenu';
// import ServerStatus from './ServerStatus';
import { ThronetekiUser } from '../../types/user';
// import GameContextMenu from './GameContextMenu';

import SmallHeaderIcon from '../../assets/img/header_icon_light.png';
import SmallHeaderIconDark from '../../assets/img/header_icon.png';
import HeaderIcon from '../../assets/img/main_header_logo.png';
import ProfileDropdown from './ProfileDropdown';
import GameContextMenu from './GameContextMenu';
import ServerStatus from './ServerStatus';

export interface UserSettings {
    customBackground: string | undefined;
    background: string;
}

const Navigation = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();

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

    const renderMenuItems = (menuItems: MenuItem[]) => {
        return filterMenuItems(menuItems, user).map((menuItem, index) => {
            //            const children = menuItem.childItems && filterMenuItems(menuItem.childItems, user);

            // if (children && children.length > 0) {
            //     return (
            //         <NavDropdown
            //             key={menuItem.title}
            //             id={`nav-${menuItem.title}`}
            //             title={t(menuItem.title)}
            //         >
            //             {children.map((childItem) =>
            //                 childItem.path ? (
            //                     <NavDropdown.Item
            //                         as={Link}
            //                         to={childItem.path}
            //                         className='navbar-item interactable dropdown-child'
            //                     >
            //                         {t(childItem.title)}
            //                     </NavDropdown.Item>
            //                 ) : null
            //             )}
            //         </NavDropdown>
            //     );
            // }

            if (!menuItem.path) {
                return <React.Fragment key={index}></React.Fragment>;
            }

            return (
                <NavbarMenuItem key={index}>
                    <Link
                        className='w-full font-[PoppinsMedium] text-emphasis transition-colors duration-500 ease-in-out hover:text-white'
                        size='lg'
                        as={RouterLink}
                        to={menuItem.path}
                    >
                        {t(menuItem.title)}
                    </Link>
                </NavbarMenuItem>
            );
        });
    };

    const numGames = (
        <li className='navbar-item font-[PoppinsMedium]'>
            <span>{t('{{gameLength}} Games', { gameLength: games?.length })}</span>
        </li>
    );

    return (
        <Navbar isBordered height='3rem' maxWidth='full'>
            <NavbarContent className='lg:hidden' justify='start'>
                <NavbarMenuToggle />
            </NavbarContent>
            <NavbarContent className='pr-3 lg:hidden' justify='center'>
                <NavbarBrand as={RouterLink} to='/'>
                    <img
                        src={theme === 'light' ? SmallHeaderIcon : SmallHeaderIconDark}
                        width='32'
                        height='32'
                        className='inline-block align-top'
                        alt='The Iron Throne Logo'
                    />
                </NavbarBrand>
            </NavbarContent>
            <NavbarContent className='lg:hidden' justify='end'>
                <ProfileDropdown menu={ProfileMenu} user={user} />
            </NavbarContent>

            <NavbarMenu>{renderMenuItems(LeftMenu)}</NavbarMenu>

            <NavbarContent className='hidden lg:flex' justify='start'>
                {renderMenuItems(LeftMenu)}
            </NavbarContent>
            <NavbarContent className='hidden lg:flex' justify='center'>
                <NavbarBrand as={RouterLink} to='/'>
                    <Image
                        src={/*activeGame?.started ? SmallHeaderIcon :*/ HeaderIcon}
                        style={{ height: '48px' }}
                        alt='TCO Logo'
                    />
                </NavbarBrand>
            </NavbarContent>
            <NavbarContent className='hidden lg:flex' justify='end'>
                <GameContextMenu />
                {!activeGame?.started && numGames}
                {activeGame?.started ? (
                    <ServerStatus
                        connected={gameConnected}
                        connecting={gameConnecting}
                        serverType='Game server'
                        responseTime={gameResponseTime}
                    />
                ) : (
                    <ServerStatus
                        connected={lobbyConnected}
                        connecting={lobbyConnecting}
                        serverType='Lobby'
                        responseTime={lobbyResponseTime}
                    />
                )}
                {renderMenuItems(RightMenu)}
                <ProfileDropdown menu={ProfileMenu} user={user} />
                {/* <LanguageSelector />*/}
            </NavbarContent>
        </Navbar>
    );
};

export default Navigation;
