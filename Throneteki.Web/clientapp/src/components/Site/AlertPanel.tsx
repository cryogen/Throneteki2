import React, { ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faExclamationCircle,
    faExclamationTriangle,
    faInfoCircle,
    faCheckCircle,
    faBell
} from '@fortawesome/free-solid-svg-icons';
import { Alert } from 'react-bootstrap';

export enum AlertType {
    Default = 'default',
    Primary = 'primary',
    Info = 'info',
    Warning = 'warning',
    Danger = 'danger',
    Success = 'success',
    Bell = 'bell'
}

interface AlertPanelProps {
    children: ReactNode | ReactNode[];
    className?: string;
    title?: string;
    message?: string;
    noIcon?: boolean;
    titleClass?: string;
    type: AlertType;
}

/**
 * @param {string} message
 */
function getMessageWithLinks(message: string) {
    const links = message.match(/(https?:\/\/)?([^.\s]+)?[^.\s]+\.[^\s]+/gi);
    const retMessage = [];

    if (!links || links.length === 0) {
        return message;
    }

    let lastIndex = 0;
    let linkCount = 0;

    for (const link of links) {
        const index = message.indexOf(link);

        retMessage.push(message.substring(lastIndex, index));
        retMessage.push(
            <Alert.Link key={linkCount++} href={link}>
                {link}
            </Alert.Link>
        );

        lastIndex += index + link.length;
    }

    retMessage.push(message.substr(lastIndex, message.length - lastIndex));

    return retMessage;
}

const AlertPanel = ({
    type = AlertType.Info,
    title,
    message,
    noIcon = false,
    children
}: AlertPanelProps) => {
    let icon;
    /**
     * @type {AlertType}
     */
    let alertType;

    switch (type) {
        case AlertType.Warning:
            icon = faExclamationTriangle;
            alertType = 'warning';
            break;
        case AlertType.Danger:
            icon = faExclamationCircle;
            alertType = 'danger';
            break;
        case AlertType.Info:
            icon = faInfoCircle;
            alertType = 'info';
            break;
        case AlertType.Success:
            icon = faCheckCircle;
            alertType = 'success';
            break;
        case AlertType.Bell:
            icon = faBell;
            alertType = 'primary';
            break;
    }

    return (
        <Alert variant={alertType}>
            {title && <Alert.Heading>{title}</Alert.Heading>}
            {!noIcon && <FontAwesomeIcon icon={icon} />}
            {message && <span id='alert-message'>&nbsp;{getMessageWithLinks(message)}</span>}
            {children && <span>&nbsp;{children}</span>}
        </Alert>
    );
};

AlertPanel.displayName = 'AlertPanel';

export default AlertPanel;
