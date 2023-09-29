import { useState } from 'react';
import { ColumnFilter } from '@tanstack/react-table';
import LoadingSpinner from '../LoadingSpinner';
import { Button, Checkbox } from '@nextui-org/react';

interface TableGroupFilterProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetchData: any;
    filter: ColumnFilter;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                    <Checkbox
                        isSelected={filters[option]}
                        onValueChange={(value) => {
                            setFilters((prevState) => ({
                                ...prevState,
                                [option]: value
                            }));
                        }}
                    >
                        {option}
                    </Checkbox>
                </div>
            );
        });
    }

    return (
        <>
            {content}
            <Button
                color='primary'
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
            <Button className='ms-2' color='default' onClick={() => document.body.click()}>
                Cancel
            </Button>
        </>
    );
};

export default TableGroupFilter;
