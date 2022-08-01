import React from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faBan } from '@fortawesome/free-solid-svg-icons';

import './ServerStatus.scss';

interface ServerStatusProps {
    connected: boolean;
    connecting: boolean;
    responseTime: number;
    serverType: string;
}

const ServerStatus = (props: ServerStatusProps) => {
    const { connecting, connected, responseTime, serverType } = props;
    const { t } = useTranslation();

    let className = '';
    let toolTip = `${serverType} is`;
    let pingText;
    let icon = faCheckCircle;

    if (connected) {
        className += ' text-success';
        toolTip += ' connected';

        let pingClass;

        if (responseTime === undefined || responseTime < 0) {
            pingText = <span>{t('Waiting for ping')}</span>;
        } else {
            if (responseTime < 150) {
                pingClass = 'text-success';
            } else if (responseTime < 300) {
                pingClass = 'text-warning';
            } else {
                pingClass = 'text-danger';
            }

            pingText = (
                <>
                    <span>{serverType}: </span>
                    <span className={pingClass}>{responseTime}ms</span>
                </>
            );
        }
    } else if (connecting) {
        className += ' text-warning';
        icon = faTimesCircle;
        toolTip += ' connecting';
        pingText = (
            <>
                <span>{serverType}: </span>
                <span className='text-warning'>{t('Connecting')}</span>
            </>
        );
    } else {
        className += ' text-danger';
        icon = faBan;
        toolTip += ' disconnected';
        pingText = (
            <>
                <span>{serverType}: </span>
                <span className='text-danger'>{t('Disconnected')}</span>
            </>
        );
    }

    return (
        <li className='server-status'>
            {pingText}
            <span className={className}>
                <FontAwesomeIcon icon={icon} title={t(toolTip)} />
            </span>
        </li>
    );
};

ServerStatus.displayName = 'ServerStatus';

export default ServerStatus;
