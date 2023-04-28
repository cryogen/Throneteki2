import React, { ReactNode } from 'react';
import { Card } from 'react-bootstrap';

enum PanelType {
    Default = 'default',
    Primary = 'primary',
    Info = 'info',
    Warning = 'warning',
    Danger = 'danger'
}

interface PanelProps {
    children: ReactNode | ReactNode[];
    className?: string;
    title?: string;
    titleClass?: string;
    type?: string;
}

const Panel = ({
    className,
    type = PanelType.Primary,
    title,
    titleClass,
    children
}: PanelProps) => {
    return (
        <Card border={type} bg='dark' text='light' className={className}>
            {title && (
                <Card.Header className={`${titleClass || ' '}text-center bg-primary`}>
                    {title}
                </Card.Header>
            )}
            <Card.Body>{children}</Card.Body>
        </Card>
    );
};

export default Panel;
