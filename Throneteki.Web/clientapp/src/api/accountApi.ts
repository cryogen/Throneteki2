import axios from 'axios';

export const loginAccount = async (username: string, password: string) => {
    const response = await axios.post('/api/account/login', {
        username: username,
        password: password
    });

    return response;
};

export const registerAccount = async (username: string, email: string, password: string) => {
    const response = await axios.post('/api/account/register', {
        username: username,
        email: email,
        password: password
    });

    return response;
};
