import { ReactNode, useState } from 'react';
import classNames from 'classnames';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faBars } from '@fortawesome/free-solid-svg-icons';

interface SidebarProps {
    children: ReactNode | ReactNode[];
}

const SideBar = ({ children }: SidebarProps) => {
    const [expanded, setExpanded] = useState(false);

    const sidebarClass = classNames(
        'hidden md:block absolute left-0 bottom-0 top-0 z-50 bg-content1 bg-opacity-70',
        {
            'w-48': expanded,
            'w-12': !expanded
        }
    );

    const burgerClass = classNames('btn-icon', {
        'float-end': expanded
    });

    const icon = expanded ? faTimes : faBars;

    return (
        <div className={sidebarClass}>
            <div className='bg-content1'></div>
            <a href='#' className={burgerClass} onClick={() => setExpanded(!expanded)}>
                <FontAwesomeIcon icon={icon} />
            </a>
            {expanded && children}
        </div>
    );
};

SideBar.displayName = 'SideBar';

export default SideBar;
