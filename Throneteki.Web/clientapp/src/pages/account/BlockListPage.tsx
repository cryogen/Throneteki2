import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import * as yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Formik } from 'formik';

import Panel from '../../components/site/Panel';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
    useAddBlockListEntryMutation,
    useGetBlockListQuery,
    ApiError
} from '../../redux/api/apiSlice';
import { BlockListEntry } from '../../types/user';
import Alert from '../../components/site/Alert';
import { Button, Input, Table } from '@nextui-org/react';

interface AddBlockListEntry {
    blockee: string;
}

const BlockListPage = () => {
    const auth = useAuth();
    const { t } = useTranslation();
    const [error, setError] = useState('');

    const {
        data: response,
        isLoading,
        isSuccess,
        isError
    } = useGetBlockListQuery(auth.user?.profile.sub);
    const [addBlockListEntry, { isLoading: isAddLoading }] = useAddBlockListEntryMutation();

    const sortedBlockList = useMemo(() => {
        const sortedBlockList = response?.blockList ? response.blockList.slice() : [];
        sortedBlockList.sort((a: BlockListEntry, b: BlockListEntry) =>
            b.username.localeCompare(a.username)
        );
        return sortedBlockList;
    }, [response?.blockList]);

    const onAddClicked = async (values: AddBlockListEntry) => {
        try {
            const response = await addBlockListEntry({
                userId: auth.user?.profile.sub,
                blockee: values.blockee
            }).unwrap();

            if (!response.success) {
                setError(response.message);
            }
        } catch (err) {
            const apiError = err as ApiError;
            setError(
                t(
                    apiError.data.message ||
                        'An error occured adding the block list entry. Please try again later.'
                )
            );
        }
    };

    const schema = yup.object({
        blockee: yup.string().required(t('You must specify a username to block.'))
    });

    let content;

    if (isLoading) {
        content = <LoadingSpinner text='Loading blocklist, please wait...' />;
    } else if (isError) {
        content = (
            <Alert variant='danger'>
                {t('An error occured loading the block list. Please try again later.')}
            </Alert>
        );
    } else if (isSuccess) {
        const initialValues: AddBlockListEntry = {
            blockee: ''
        };

        const blockListToRender = sortedBlockList.map((entry: BlockListEntry) => {
            return (
                <tr key={entry.id}>
                    <td>{entry.username}</td>
                    <td>
                        <a
                            href='#'
                            className='text-danger'
                            // onClick={onAddClicked}
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </a>
                    </td>
                </tr>
            );
        });

        const table =
            sortedBlockList.length === 0 ? (
                <div>
                    <Trans>No users currently blocked</Trans>
                </div>
            ) : (
                <Table isStriped className='blocklist'>
                    <thead>
                        <tr>
                            <th>
                                <Trans>Username</Trans>
                            </th>
                            <th>
                                <Trans>Remove</Trans>
                            </th>
                        </tr>
                    </thead>
                    <tbody>{blockListToRender}</tbody>
                </Table>
            );

        content = (
            <div>
                <Formik
                    validationSchema={schema}
                    onSubmit={onAddClicked}
                    initialValues={initialValues}
                >
                    {(formProps) => (
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                formProps.handleSubmit(event);
                            }}
                        >
                            <p>
                                <Trans i18nKey='blocklist.explain'>
                                    It can sometimes become necessary to prevent someone joining
                                    your games, or stop seeing their messages, or both. Users on
                                    this list will not be able to join your games, and you will not
                                    see their chat messages or their games.
                                </Trans>
                            </p>
                            <div>
                                <Input
                                    label={t('Username')}
                                    placeholder={t('Enter username to block')}
                                    errorMessage={formProps.errors.blockee}
                                    name='blockee'
                                    {...formProps.getFieldProps('blockee')}
                                />
                            </div>

                            <Button
                                color='primary'
                                type='submit'
                                disabled={isAddLoading}
                                isLoading={isAddLoading}
                            >
                                <Trans>Add</Trans>
                            </Button>

                            <div className='mt-3'>
                                <h3 className='font-weight-bold'>
                                    <Trans>Users Blocked</Trans>
                                </h3>
                                {table}
                            </div>
                        </form>
                    )}
                </Formik>
            </div>
        );
    }

    return (
        <div>
            <Panel title={t('BlockList')}>
                {error && <Alert variant='danger'>{error}</Alert>}
                {content}
            </Panel>
        </div>
    );
};

export default BlockListPage;
