import { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Trans, useTranslation } from 'react-i18next';

import Panel from '../../components/site/Panel';
import { News } from '../../types/lobby';
import ReactTable, { TableButton } from '../../components/table/ReactTable';
import {
    ApiError,
    useAddAdminNewsItemMutation,
    useDeleteNewsAdminMutation,
    useGetNewsAdminQuery,
    useSaveNewsAdminMutation
} from '../../redux/api/apiSlice';
import { Button, Textarea } from '@nextui-org/react';
import Alert from '../../components/site/Alert';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { toastr } from 'react-redux-toastr';

const NewsAdminPage = () => {
    const { t } = useTranslation();
    const [addNewsEntry, { isLoading: isAddLoading }] = useAddAdminNewsItemMutation();
    const [saveNewsEntry, { isLoading: isSaveLoading }] = useSaveNewsAdminMutation();
    const [deleteNewsEntries, { isLoading: isDeleteLoading }] = useDeleteNewsAdminMutation();
    const [error, setError] = useState('');
    const [newsText, setNewsText] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    const columns = useMemo<ColumnDef<News>[]>(
        () => [
            {
                accessorKey: 'text',
                header: t('Text') as string,
                cell: (info) => {
                    return <Trans>{info.getValue() as string}</Trans>;
                },
                meta: {
                    colWidth: '35%'
                }
            },
            {
                accessorKey: 'publishedAt',
                header: t('Published At') as string,
                cell: (info) =>
                    moment(info.getValue() as Date)
                        .local()
                        .format('YYYY-MM-DD HH:mm'),
                meta: {
                    colWidth: '35%'
                }
            },
            {
                accessorKey: 'publisher',
                header: t('Publisher') as string,
                cell: (info) => {
                    return <Trans>{info.getValue() as string}</Trans>;
                },
                meta: {
                    colWidth: '35%'
                }
            }
        ],
        [t]
    );

    const buttons: TableButton[] = [
        {
            color: 'danger',
            icon: <FontAwesomeIcon icon={faTrashAlt} />,
            label: t('Delete'),
            disabled: selectedIds.length === 0,
            isLoading: isDeleteLoading,
            onClick: () => {
                toastr.confirm(
                    t(
                        `Are you sure you want to delete ${
                            selectedIds.length === 1 ? 'this news entry' : 'these news entries'
                        }?`
                    ),
                    {
                        okText: t('Yes'),
                        cancelText: t('Cancel'),
                        onOk: async () => {
                            try {
                                const response = await deleteNewsEntries(selectedIds).unwrap();

                                if (!response.success) {
                                    setError(response.message);
                                }
                            } catch (err) {
                                const apiError = err as ApiError;
                                setError(
                                    t(
                                        apiError.data?.message ||
                                            'An error occured deleting the news entry(s). Please try again later.'
                                    )
                                );
                            }
                        }
                    }
                );
            }
        }
    ];
    const onAddClicked = async (text: string) => {
        setError('');
        try {
            const response = await addNewsEntry(text).unwrap();

            if (!response.success) {
                setError(response.message);
            }
        } catch (err) {
            const apiError = err as ApiError;
            setError(
                t(
                    apiError.data?.message ||
                        'An error occured adding the news entry. Please try again later.'
                )
            );
        }
    };

    const onSaveClicked = async (text: string) => {
        setError('');
        try {
            const response = await saveNewsEntry({ newsId: selectedItem.id, text: text }).unwrap();

            if (!response.success) {
                setError(response.message);
            }
        } catch (err) {
            const apiError = err as ApiError;
            setError(
                t(
                    apiError.data?.message ||
                        'An error occured saving the news entry. Please try again later.'
                )
            );
        }
    };

    return (
        <div className='mx-auto w-3/4'>
            <Panel title='News Admin'>
                {error && (
                    <div className='mb-2'>
                        <Alert variant='danger'>{error}</Alert>
                    </div>
                )}
                <ReactTable
                    buttons={buttons}
                    columns={columns}
                    dataLoadFn={useGetNewsAdminQuery}
                    onRowClick={(row) => {
                        setSelectedItem(row.original);
                        setNewsText(row.original.text);
                    }}
                    onRowSelectionChange={(ids) => setSelectedIds(ids.map((r) => r.original.id))}
                />

                <Textarea
                    className='mt-2'
                    label={selectedItem ? t('News text') : t('Enter new news item')}
                    onValueChange={(text) => setNewsText(text)}
                    value={newsText}
                />
                <div>
                    {selectedItem ? (
                        <div>
                            <Button
                                className='mr-2 mt-2'
                                color='primary'
                                isLoading={isSaveLoading}
                                onClick={() => onSaveClicked(newsText)}
                            >
                                <Trans>Save</Trans>
                            </Button>
                            <Button
                                className='mt-2'
                                color='default'
                                onClick={() => {
                                    setSelectedItem(null);
                                    setNewsText('');
                                }}
                            >
                                <Trans>Cancel</Trans>
                            </Button>
                        </div>
                    ) : (
                        <Button
                            className='mt-2'
                            color='primary'
                            isLoading={isAddLoading}
                            onClick={() => onAddClicked(newsText)}
                        >
                            <Trans>Add</Trans>
                        </Button>
                    )}
                </div>
            </Panel>
        </div>
    );
};

export default NewsAdminPage;
