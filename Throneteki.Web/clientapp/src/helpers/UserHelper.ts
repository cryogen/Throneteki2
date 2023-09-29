import { User } from 'oidc-client-ts';

export const getUser = () => {
    const oidcStorage = localStorage.getItem(
        `oidc.user:${import.meta.env.VITE_AUTH_URL}:${import.meta.env.VITE_CLIENT_ID}`
    );
    if (!oidcStorage) {
        return null;
    }

    return User.fromStorageString(oidcStorage);
};
