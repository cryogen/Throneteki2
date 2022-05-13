import React from 'react';
import classNames from 'classnames';

import './Avatar.scss';
import { Profile } from 'oidc-client';

export interface AvatarProps {
    float?: boolean;
    user: Profile;
}

const Avatar = (props: AvatarProps) => {
    const className = classNames('gravatar', {
        'pull-left': props.float
    });

    if (!props.user) {
        return null;
    }

    return <img className={className} src={props.user.picture} alt='' />;
};

export default Avatar;
