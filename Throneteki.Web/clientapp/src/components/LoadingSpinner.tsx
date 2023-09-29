import { Spinner } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';

interface LoadingSpinnerProps {
    text: string;
}

function LoadingSpinner({ text }: LoadingSpinnerProps) {
    const { t } = useTranslation();

    return (
        <div className='align-items-center justify-content-center flex flex-col'>
            <Spinner title={`${t(text)}`} />
            <div>{t(text)}</div>
        </div>
    );
}

export default LoadingSpinner;
