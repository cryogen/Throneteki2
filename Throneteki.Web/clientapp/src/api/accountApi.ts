import axios from 'axios';

export const registerAccount = async (username: string, email: string, password: string) => {
    const response = await axios.post('/api/account/register', {
        username: username,
        email: email,
        password: password
    });

    return response;
};
