import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ButtonProps } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

interface FaIconButtonProps extends ButtonProps {
    text?: string;
    icon: IconDefinition;
}

const FaIconButton = ({ text, icon, ...rest }: FaIconButtonProps) => {
    return (
        <Button {...rest}>
            {text && (
                <Trans>
                    <span className='pe-2'>{text}</span>
                </Trans>
            )}
            <FontAwesomeIcon icon={icon} />
        </Button>
    );
};

export default FaIconButton;
