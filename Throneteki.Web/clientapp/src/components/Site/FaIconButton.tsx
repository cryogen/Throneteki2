import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Trans } from 'react-i18next';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonProps } from '@nextui-org/react';

interface FaIconButtonProps extends ButtonProps {
    text?: string;
    icon: IconDefinition;
}

const FaIconButton = ({ text, icon, ...rest }: FaIconButtonProps) => {
    return (
        <Button {...rest} endContent={<FontAwesomeIcon icon={icon} />}>
            {text && (
                <Trans>
                    <span className='pe-2'>{text}</span>
                </Trans>
            )}
        </Button>
    );
};

export default FaIconButton;
