import React, { useEffect, useState } from 'react';
import { Form, FormControlProps } from 'react-bootstrap';
import { FeedbackProps } from 'react-bootstrap/esm/Feedback';
import { BsPrefixRefForwardingComponent } from 'react-bootstrap/esm/helpers';

const DebouncedInput = ({
    value: initialValue,
    onChange,
    debounce = 500,
    ...props
}: {
    value: string | number;
    onChange: (value: string | number) => void;
    debounce?: number;
} & Omit<
    BsPrefixRefForwardingComponent<'input', FormControlProps> & FeedbackProps,
    'onChange'
>) => {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            onChange(value);
        }, debounce);

        return () => clearTimeout(timeout);
    }, [value, debounce, onChange]);

    return <Form.Control {...props} value={value} onChange={(e) => setValue(e.target.value)} />;
};

export default DebouncedInput;
