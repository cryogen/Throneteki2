import { Trans } from 'react-i18next';
import { UserSummary } from '../../types/lobby';
import { Avatar } from '@nextui-org/react';

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
            <div className='font-normal text-left flex items-center' key={user.username}>
                <Avatar src={user.avatar} />
                <span className='ml-2'>{user.username}</span>
            </div>
        );
    });

    return (
        <div className='font-bold pb-5 pt-2 text-center'>
            <Trans>Online Users</Trans>
            {userList}
        </div>
    );
};

UserList.displayName = 'UserList';

export default UserList;
