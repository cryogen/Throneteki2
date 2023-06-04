import React, { ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ButtonProps } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

interface FaIconButtonProps extends ButtonProps {
    children?: ReactNode | ReactNode[];
    text?: string;
    icon: IconDefinition;
}

const FaIconButton = ({ children, text, icon, ...rest }: FaIconButtonProps) => {
    return (
        <Button {...rest}>
            {text && (
                <Trans>
                    <span className='pe-2'>{text}</span>
                </Trans>
            )}
            <FontAwesomeIcon icon={icon} />
            {children}
        </Button>
    );
};

export default FaIconButton;
