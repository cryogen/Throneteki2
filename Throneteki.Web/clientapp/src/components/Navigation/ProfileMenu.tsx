import { Profile } from 'oidc-client';
import React from 'react';
import { NavDropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import Avatar from '../Site/Avatar';
import { MenuItem } from './menus';

type ProfileMenuProps = {
    menu: MenuItem[];
    user: Profile | null | undefined;
};

const ProfileMenu: React.FC<ProfileMenuProps> = (props) => {
    const { t } = useTranslation('navigation');

    if (!props.user) {
        return null;
    }
    const title = (
        <span>
            <Avatar username={props.user.name}></Avatar>
            {props.user.name}
        </span>
    );

    return (
        <NavDropdown title={title} id='nav-dropdown'>
            {props.menu.map((menuItem: MenuItem) => {
                if (!menuItem.path) {
                    return null;
                }

                return (
                    <NavDropdown.Item key={menuItem.path} as={Link} to={menuItem.path}>
                        {t(menuItem.title)}
                    </NavDropdown.Item>
                );
            })}
        </NavDropdown>
    );
};

export default ProfileMenu;
