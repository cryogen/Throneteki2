import { PropsWithChildren } from 'react';

interface StatContainerProps extends PropsWithChildren {
    title?: string;
}

const StatContainer = ({ children, title = null }: StatContainerProps) => {
    return (
        <div
            title={title}
            className='flex h-9 min-w-fit items-center border-r-2 border-dotted border-r-blue-900 px-2 last-of-type:border-none'
        >
            {children}
        </div>
    );
};

export default StatContainer;
