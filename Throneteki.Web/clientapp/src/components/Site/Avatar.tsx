import React from 'react';
import classNames from 'classnames';

import './Avatar.scss';

export interface AvatarProps {
    float?: boolean;
    username?: string;
}

const Avatar = (props: AvatarProps) => {
    const className = classNames('gravatar', {
        'pull-left': props.float
    });

    if (!props.username) {
        return null;
    }

    return <img className={className} src={`/img/avatar/${props.username}.png`} alt='' />;
};

export default Avatar;
