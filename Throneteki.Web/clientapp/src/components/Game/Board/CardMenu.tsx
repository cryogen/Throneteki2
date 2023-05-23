import classNames from 'classnames';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CardMenuItem } from '../../../types/game';

interface CardMenuProps {
    menu: CardMenuItem[];
    onMenuItemClick: (menuItem: CardMenuItem) => void;
}

const CardMenu = ({ menu, onMenuItemClick }: CardMenuProps) => {
    const [submenu, setSubmenu] = useState<string | null>();
    const { t } = useTranslation();
    let menuIndex = 0;

    const menuItemClick = (menuItem: CardMenuItem) => {
        if (['main', 'tokens'].includes(menuItem.command)) {
            setSubmenu(menuItem.command);
        } else {
            if (onMenuItemClick) {
                onMenuItemClick(menuItem);
            }
        }
    };

    const menuItems = menu.map((menuItem: CardMenuItem) => {
        const className = classNames('menu-item', {
            disabled: !!menuItem.disabled
        });
        if (menuItem.menu === submenu) {
            return (
                <div
                    key={menuIndex++}
                    className={className}
                    onClick={menuItemClick.bind(this, menuItem)}
                >
                    {t(menuItem.text)}
                </div>
            );
        }
    });

    return <div className='panel menu'>{menuItems}</div>;
};

export default CardMenu;
