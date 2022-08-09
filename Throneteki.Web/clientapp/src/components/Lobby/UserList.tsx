import * as React from 'react';
import { Trans } from 'react-i18next';
import { UserSummary } from '../../types/lobby';

import Avatar from '../Site/Avatar';

interface UserListProps {
    users: UserSummary[];
}

const UserList = ({ users }: UserListProps) => {
    if (!users) {
        return (
            <div>
                <Trans>Userlist loading...</Trans>
            </div>
        );
    }

    const userList = users.map((user) => {
        return (
            <div className='user-row' key={user.username}>
                <Avatar avatar={user.avatar} />
                <span>{user.username}</span>
            </div>
        );
    });

    return (
        <div className='userlist'>
            <Trans>Online Users</Trans>
            {userList}
        </div>
    );
};

UserList.displayName = 'UserList';

export default UserList;
