import React from 'react';
import classNames from 'classnames';

export interface AvatarProps {
    float?: boolean;
    avatar?: string;
}

const Avatar = (props: AvatarProps) => {
    const className = classNames('gravatar', {
        'pull-left': props.float
    });

    if (!props.avatar) {
        return null;
    }

    return <img className={className} src={props.avatar} alt='' />;
};

export default Avatar;
