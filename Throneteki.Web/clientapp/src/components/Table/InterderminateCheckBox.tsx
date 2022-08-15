import React, { HTMLProps, useEffect } from 'react';

const IndeterminateCheckbox = ({
    indeterminate,
    className = '',
    ...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) => {
    const ref = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (typeof indeterminate === 'boolean' && ref?.current) {
            ref.current.indeterminate = !rest.checked && indeterminate;
        }
    }, [ref, indeterminate, rest.checked]);

    return <input type='checkbox' ref={ref} className={className + ' cursor-pointer'} {...rest} />;
};

export default IndeterminateCheckbox;
