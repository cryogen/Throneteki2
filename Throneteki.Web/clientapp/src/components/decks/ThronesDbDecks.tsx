import { useState, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faDownload,
    faCloudArrowUp,
    faCircleCheck,
    faCircleNotch,
    faRightLeft
} from '@fortawesome/free-solid-svg-icons';

import {
    ApiError,
    useGetThronesDbDecksQuery,
    useImportThronesDbDecksMutation,
    useLinkThronesDbAccountMutation,
    useSyncThronesDbDecksMutation
} from '../../redux/api/apiSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ThronesDbDeck } from '../../types/decks';
import { ColumnDef, Row, RowData } from '@tanstack/react-table';
import moment from 'moment';
import Alert from '../site/Alert';
import { Button } from '@nextui-org/react';
import ReactTable, { TableButton } from '../table/ReactTable';

declare module '@tanstack/table-core' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ColumnMeta<TData extends RowData, TValue> {
        colWidth: number;
    }
}

const ThronesDbDecks = () => {
    const { t } = useTranslation();
    const [error, setError] = useState('');
    const [selectedRows, setSelectedRows] = useState<Row<ThronesDbDeck>[]>([]);
    const { data: response, isLoading, isError, refetch } = useGetThronesDbDecksQuery({});
    const [importDecks, { isLoading: isImportLoading }] = useImportThronesDbDecksMutation();
    const [linkAccount, { isLoading: isLinkLoading }] = useLinkThronesDbAccountMutation();
    const [syncDecks, { isLoading: isSyncLoading }] = useSyncThronesDbDecksMutation();

    const onImportClick = async (deckIds: number[]) => {
        setError('');

        try {
            const response = await importDecks(deckIds).unwrap();

            if (!response.success) {
                setError(response.message);
            }
        } catch (err) {
            const apiError = err as ApiError;
            setError(
                t(
                    apiError.data.message ||
                        'An error occured importing decks. Please try again later.'
                )
            );
        }
    };

    const onSyncClick = async () => {
        setError('');

        try {
            const response = await syncDecks({}).unwrap();

            if (!response.success) {
                setError(response.message);
            }
        } catch (err) {
            const apiError = err as ApiError;
            setError(
                t(
                    apiError.data.message ||
                        'An error occured syncing decks. Please try again later.'
                )
            );
        }
    };

    let content;

    const columns = useMemo<ColumnDef<ThronesDbDeck>[]>(
        () => [
            {
                accessorKey: 'name',
                header: t('Name') as string,
                meta: {
                    colWidth: '50%'
                }
            },
            {
                accessorKey: 'factionName',
                header: t('Faction') as string,
                meta: {
                    colWidth: '20%'
                }
            },
            {
                accessorKey: 'dateCreation',
                cell: (info) =>
                    moment(info.getValue() as Date)
                        .local()
                        .format('YYYY-MM-DD HH:mm'),
                header: t('Created') as string,
                meta: {
                    colWidth: '20%'
                }
            },
            {
                accessorKey: 'dateUpdate',
                cell: (info) =>
                    moment(info.getValue() as Date)
                        .local()
                        .format('YYYY-MM-DD HH:mm'),
                header: t('Updated') as string,
                meta: {
                    colWidth: '20%'
                }
            },
            {
                id: 'is_synced',
                accessorKey: 'isSynced',
                cell: (info) =>
                    info.getValue() ? (
                        <div className='text-center text-primary'>
                            <FontAwesomeIcon icon={faCircleCheck} />
                        </div>
                    ) : null,
                enableSorting: false,
                enableColumnFilter: false,
                header: t('Synced') as string,
                meta: {
                    colWidth: '10%'
                }
            }
        ],
        [t]
    );

    if (isLoading) {
        content = <LoadingSpinner text='Loading ThronesDB decks, please wait...' />;
    } else if (isError) {
        content = (
            <Alert variant='danger'>
                {t('An error occured loading ThronesDB decks. Please try again later.')}
            </Alert>
        );
    } else if (!response.success) {
        content = (
            <div>
                <Alert variant='danger'>
                    {t('An error occured loading ThronesDB decks. Please try again later.')}
                </Alert>
                <Button
                    variant='primary'
                    onClick={async () => {
                        try {
                            const response = await linkAccount({}).unwrap();
                            window.location.replace(response.data.location);

                            if (!response.success) {
                                setError(response.message);
                            } else {
                                // setSuccess(t('Settings saved successfully.'));
                            }
                        } catch (err) {
                            const apiError = err as ApiError;
                            setError(
                                t(
                                    apiError.data.message ||
                                        'An error occured linking your account. Please try again later.'
                                )
                            );
                        }
                    }}
                >
                    <Trans>Link account</Trans>
                    {isLinkLoading && <FontAwesomeIcon icon={faCircleNotch} spin />}
                </Button>
            </div>
        );
    } else if (response.data.length === 0) {
        content = (
            <Alert variant={AlertType.Info}>
                {t('There are no decks in your ThronesDB account to import.')}
            </Alert>
        );
    } else {
        const buttons: TableButton[] = [
            {
                color: 'default',
                disabled: selectedRows.length === 0,
                label: t('Import Selected'),
                icon: <FontAwesomeIcon icon={faDownload} />,
                isLoading: isImportLoading,
                onClick: async () => {
                    await onImportClick(selectedRows.map((r: Row<ThronesDbDeck>) => r.original.id));
                }
            },
            {
                color: 'default',
                icon: <FontAwesomeIcon icon={faCloudArrowUp} />,
                label: t('Import All'),
                onClick: async () => {
                    await onImportClick(response.data.map((d: ThronesDbDeck) => d.id));
                },
                isLoading: isImportLoading
            },
            {
                color: 'default',
                label: t('Sync'),
                icon: <FontAwesomeIcon icon={faRightLeft} />,
                onClick: async () => {
                    await onSyncClick();
                },
                isLoading: isSyncLoading
            }
        ];

        content = (
            <div className='h-[75vh]'>
                <ReactTable
                    buttons={buttons}
                    dataLoadFn={() => ({
                        data: {
                            data: response.data,
                            totalCount: response.data.length
                        },
                        refetch: refetch,
                        isLoading: isLoading
                    })}
                    columns={columns}
                    onRowSelectionChange={(rows) => setSelectedRows(rows)}
                />
            </div>
        );
    }

    return (
        <div>
            {error && <Alert variant='danger'>{t(error)}</Alert>}
            {content}
        </div>
    );
};

export default ThronesDbDecks;
