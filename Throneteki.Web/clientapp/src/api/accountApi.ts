import axios from 'axios';

export const loginAccount = async (username: string, password: string) => {
    const response = await axios.post('/api/account/login', {
        username: username,
        password: password
    });

    return response;
};
