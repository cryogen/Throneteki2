import React from 'react';
import { Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface LoadingSpinnerProps {
    text: string;
}

function LoadingSpinner({ text }: LoadingSpinnerProps) {
    const { t } = useTranslation();

    return (
        <div className='d-flex flex-column align-items-center justify-content-center'>
            <Spinner animation='border' title={`${t(text)}`} />
            <div>{t(text)}</div>
        </div>
    );
}

export default LoadingSpinner;
