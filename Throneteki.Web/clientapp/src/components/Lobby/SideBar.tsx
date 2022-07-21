import React, { ReactNode, useState } from 'react';
import classNames from 'classnames';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faBars } from '@fortawesome/free-solid-svg-icons';

interface SidebarProps {
    children: ReactNode | ReactNode[];
}

const SideBar = ({ children }: SidebarProps) => {
    const [expanded, setExpanded] = useState(false);

    const sidebarClass = classNames('sidebar', {
        expanded: expanded,
        collapsed: !expanded
    });

    const burgerClass = classNames('btn-icon', {
        'float-right': expanded
    });

    const icon = expanded ? faTimes : faBars;

    return (
        <div className={sidebarClass}>
            <a href='#' className={burgerClass} onClick={() => setExpanded(!expanded)}>
                <FontAwesomeIcon icon={icon} />
            </a>
            {expanded && children}
        </div>
    );
};

SideBar.displayName = 'SideBar';

export default SideBar;
