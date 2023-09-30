import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Trans } from 'react-i18next';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@nextui-org/react';

interface FaIconButtonProps<T> {
    as?: T;
    text?: string;
    icon: IconDefinition;
}

function FaIconButton<T extends React.ElementType = 'button'>({
    text,
    icon,
    ...rest
}: FaIconButtonProps<T> & Omit<React.ComponentPropsWithoutRef<T>, keyof FaIconButtonProps<T>>) {
    return (
        <Button {...rest} endContent={<FontAwesomeIcon icon={icon} />}>
            {text && (
                <Trans>
                    <span className='pe-2'>{text}</span>
                </Trans>
            )}
        </Button>
    );
}

export default FaIconButton;
