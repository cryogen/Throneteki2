import { User } from 'oidc-client-ts';

export const getUser = () => {
    const oidcStorage = localStorage.getItem('oidc.user:http://throneteki.auth:7000/:throneteki');
    if (!oidcStorage) {
        return null;
    }

    return User.fromStorageString(oidcStorage);
};
