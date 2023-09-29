import { Card, CardBody, CardHeader } from '@nextui-org/react';
import { ReactNode } from 'react';

enum PanelType {
    Default = 'default',
    Primary = 'primary',
    Info = 'info',
    Warning = 'warning',
    Danger = 'danger'
}

interface PanelProps {
    children?: ReactNode | ReactNode[];
    className?: string;
    title?: string;
    titleClass?: string;
    type?: string;
    fullHeight?: boolean;
}

const Panel = ({
    className,
    type = PanelType.Primary,
    title,
    titleClass,
    children,
    fullHeight = true
}: PanelProps) => {
    return (
        <Card
            className={`${className} border-2 bg-opacity-70 border-${type} ${
                fullHeight ? 'h-full' : ''
            } shadow-lg`}
            classNames={{ body: 'h-full overflow-y-auto' }}
        >
            {title && (
                <CardHeader className={`${titleClass} justify-center bg-${type} rounded-none`}>
                    {title}
                </CardHeader>
            )}
            <CardBody>{children}</CardBody>
        </Card>
    );
};

export default Panel;
