import { useTranslation } from 'react-i18next';
import { Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/react';
import { Link } from 'react-router-dom';
import { ThronetekiUser } from '../../types/user';

import { MenuItem } from './menus';

type ProfileMenuProps = {
    menu: MenuItem[];
    user?: ThronetekiUser;
};

const ProfileDropdown = ({ user, menu }: ProfileMenuProps) => {
    const { t } = useTranslation('navigation');

    if (!user) {
        return null;
    }

    return (
        <Dropdown>
            <DropdownTrigger>
                <Avatar
                    isBordered
                    as='button'
                    className='transition-transform'
                    name={user.name}
                    size='sm'
                    src={user.picture}
                />
            </DropdownTrigger>
            <DropdownMenu variant='flat' className='font-[PoppinsMedium] text-emphasis'>
                {menu.map((mi) => (
                    <DropdownItem key={mi.title}>
                        <Link to={mi.path}>{t(mi.title)}</Link>
                    </DropdownItem>
                ))}
            </DropdownMenu>
        </Dropdown>
    );
};

export default ProfileDropdown;
