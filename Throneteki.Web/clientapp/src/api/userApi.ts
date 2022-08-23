import axios from 'axios';
import { NewProfileDetails } from '../components/Account/Settings';
import { getUser } from '../helpers/UserHelper';

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
