import { User } from 'oidc-client-ts';

export const getUser = () => {
    const oidcStorage = localStorage.getItem('oidc.user:https://localhost:7000/:throneteki');
    if (!oidcStorage) {
        return null;
    }

    return User.fromStorageString(oidcStorage);
};
