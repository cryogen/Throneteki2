import { ColumnFilter } from '@tanstack/react-table';
import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import LoadingSpinner from '../LoadingSpinner';

interface TableGroupFilterProps {
    args?: any;
    fetchData: any;
    filter: ColumnFilter;
    onOkClick: (filter: any) => void;
}

const TableGroupFilter = ({ args, fetchData, onOkClick, filter }: TableGroupFilterProps) => {
    const { data, isLoading, isError } = fetchData(args);
    const initialFilterState: Record<string, boolean> = {};

    if (filter?.value) {
        for (const value of filter.value as string[]) {
            initialFilterState[value] = true;
        }
    }

    const [filters, setFilters] = useState<Record<string, boolean>>(initialFilterState);

    let content;

    if (isLoading) {
        content = <LoadingSpinner text='Loading...' />;
    } else if (isError) {
        content = <div>Failed to load options</div>;
    } else {
        content = data.map((option: string) => {
            return (
                <div key={option}>
                    <Form.Check>
                        <Form.Check.Label className='w-100'>
                            {option}
                            <Form.Check.Input
                                checked={filters[option]}
                                onChange={(event) => {
                                    setFilters((prevState) => ({
                                        ...prevState,
                                        [option]: event.target.checked
                                    }));
                                }}
                            />
                        </Form.Check.Label>
                    </Form.Check>
                </div>
            );
        });
    }

    return (
        <>
            {content}
            <Button
                variant='primary'
                onClick={() => {
                    const filterResult = [];

                    for (const [key, value] of Object.entries(filters)) {
                        if (value) {
                            filterResult.push(key);
                        }
                    }
                    onOkClick(filterResult);

                    document.body.click();
                }}
            >
                Ok
            </Button>
            <Button className='ms-2' variant='light' onClick={() => document.body.click()}>
                Cancel
            </Button>
        </>
    );
};

export default TableGroupFilter;
