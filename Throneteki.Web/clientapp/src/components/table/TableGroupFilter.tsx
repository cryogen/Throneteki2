import { useState } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import { Button, Checkbox } from '@nextui-org/react';

interface TableGroupFilterProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetchData: any;
    filter: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onOkClick: (filter: any) => void;
    onCancelClick: () => void;
}

const TableGroupFilter = ({
    args,
    fetchData,
    onOkClick,
    filter,
    onCancelClick
}: TableGroupFilterProps) => {
    const { data, isLoading, isError } = fetchData(args);
    const initialFilterState: Record<string, boolean> = {};

    console.info(filter);

    if (filter) {
        for (const value of filter) {
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
        content = (
            <div>
                {data.map((option: string) => {
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
                })}
            </div>
        );
    }

    return (
        <>
            {content}
            <div className='mb-2 mt-2'>
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
                    }}
                >
                    Ok
                </Button>
                <Button className='ml-2' color='default' onClick={onCancelClick}>
                    Cancel
                </Button>
            </div>
        </>
    );
};

export default TableGroupFilter;
