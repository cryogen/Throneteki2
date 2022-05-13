import axios from 'axios';
import { NewProfileDetails } from '../components/Account/Profile';
import authService from '../authorisation/AuthoriseService';

export const saveProfile = async (profile: NewProfileDetails) => {
    const token = await authService.getAccessToken();

    const response = await axios.patch(`/api/user/${profile.userId}`, profile, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response;
};
