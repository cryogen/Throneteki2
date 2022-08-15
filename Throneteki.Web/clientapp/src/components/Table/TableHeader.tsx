import React from 'react';

import {
    faArrowUpLong,
    faArrowDownLong,
    faFilter,
    faMagnifyingGlass,
    faTimes
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { flexRender, HeaderGroup } from '@tanstack/react-table';
import { OverlayTrigger, InputGroup } from 'react-bootstrap';
import DebouncedInput from '../Site/DebouncedInput';

interface TableHeaderProps<T> {
    headerGroups: HeaderGroup<T>[];
}

const TableHeader: <T>({ headerGroups }: TableHeaderProps<T>) => JSX.Element = ({
    headerGroups
}) => {
    return (
        <>
            {headerGroups.map((headerGroup) => (
                <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                        <th
                            key={header.id}
                            colSpan={header.colSpan}
                            className={`user-select-none align-top col-${
                                header.column.columnDef.meta?.colWidth || 3
                            }`}
                        >
                            {header.isPlaceholder ? null : (
                                <>
                                    <div
                                        className={`d-flex ${
                                            header.column.id === 'select'
                                                ? 'justify-content-center'
                                                : 'justify-content-between'
                                        }`}
                                    >
                                        <span
                                            className='flex-grow-1'
                                            role={header.column.getCanSort() ? 'button' : ''}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                        </span>
                                        {{
                                            asc: (
                                                <div>
                                                    {' '}
                                                    <FontAwesomeIcon icon={faArrowUpLong} />
                                                </div>
                                            ),
                                            desc: (
                                                <div>
                                                    {' '}
                                                    <FontAwesomeIcon icon={faArrowDownLong} />
                                                </div>
                                            )
                                        }[header.column.getIsSorted() as string] ?? null}
                                        {header.column.columnDef.meta?.groupingFilter && (
                                            <>
                                                <OverlayTrigger
                                                    trigger='click'
                                                    placement='right'
                                                    rootClose={true}
                                                    overlay={header.column.columnDef.meta?.groupingFilter(
                                                        header.getContext().table
                                                    )}
                                                >
                                                    <FontAwesomeIcon icon={faFilter} />
                                                </OverlayTrigger>
                                            </>
                                        )}
                                    </div>
                                    {header.column.getCanFilter() &&
                                        !header.column.columnDef.meta?.groupingFilter && (
                                            <InputGroup>
                                                <>
                                                    <InputGroup.Text className='border-dark bg-dark text-light'>
                                                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                                                    </InputGroup.Text>
                                                    <DebouncedInput
                                                        className=''
                                                        value={
                                                            header.column.getFilterValue() as string
                                                        }
                                                        onChange={(value) =>
                                                            header.column.setFilterValue(value)
                                                        }
                                                    />
                                                    {header.column.getFilterValue() && (
                                                        <button
                                                            type='button'
                                                            className='btn bg-transparent text-danger'
                                                            style={{
                                                                marginLeft: '-40px',
                                                                zIndex: '100'
                                                            }}
                                                            onClick={() => {
                                                                header.column.setFilterValue('');
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faTimes} />
                                                        </button>
                                                    )}
                                                </>
                                            </InputGroup>
                                        )}
                                </>
                            )}
                        </th>
                    ))}
                </tr>
            ))}
        </>
    );
};

export default TableHeader;
