import axios from 'axios';
import { User } from 'oidc-client-ts';
import { NewProfileDetails } from '../components/Account/Profile';

function getUser() {
    const oidcStorage = sessionStorage.getItem('oidc.user:https://localhost:44460/:throneteki');
    if (!oidcStorage) {
        return null;
    }

    return User.fromStorageString(oidcStorage);
}

export const saveProfile = async (profile: NewProfileDetails) => {
    const user = getUser();
    const token = user?.access_token;
    const response = await axios.patch(`/api/user/${profile.userId}`, profile, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response;
};
