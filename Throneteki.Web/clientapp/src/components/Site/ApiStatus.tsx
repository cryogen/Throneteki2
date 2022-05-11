import React from 'react';
import { Alert } from 'react-bootstrap';

import { ApiState, ApiStatus as ApiStatusEnum } from '../../slices/account';

interface ApiStatusProps {
    state?: ApiState;
    onClose: () => void;
}

const ApiStatus = (props: ApiStatusProps) => {
    if (!props.state?.status || props.state.status == ApiStatusEnum.Loading) {
        return null;
    }

    let error;
    let index = 0;
    if (props.state.message instanceof Array) {
        error = (
            <ul className='mb-0'>
                {Object.values(props.state.message).map((message) => {
                    return <li key={index++}>{message}</li>;
                })}
            </ul>
        );
    } else {
        error = props.state.message;
    }

    if (!error) {
        return null;
    }

    return (
        <Alert
            variant={props.state.status == ApiStatusEnum.Success ? 'success' : 'danger'}
            dismissible
            onClose={props.onClose}
        >
            {error}
        </Alert>
    );
};

export default ApiStatus;
