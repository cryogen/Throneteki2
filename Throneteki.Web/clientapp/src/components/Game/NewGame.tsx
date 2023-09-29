import { Formik } from 'formik';
import { useTranslation, Trans } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Button, Input, Select, SelectItem } from '@nextui-org/react';
import * as yup from 'yup';

import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { GameType } from '../../types/enums';
import Panel from '../site/Panel';
import GameOptions from './GameOptions';
import GameTypes from './GameTypes';
import { lobbyActions } from '../../redux/slices/lobbySlice';
import { useGetRestrictedListQuery } from '../../redux/api/apiSlice';
import { RestrictedList } from '../../types/decks';
import Alert, { AlertType } from '../site/Alert';

const GameNameMaxLength = 64;

interface NewGameProps {
    quickJoin: boolean;
    defaultGameType?: GameType;
    defaultTimeLimit?: number;
    defaultPrivate?: boolean;
    onClosed?: () => void;
}

const NewGame = ({
    quickJoin = false,
    defaultGameType,
    defaultPrivate,
    defaultTimeLimit,
    onClosed
}: NewGameProps) => {
    const { t } = useTranslation();
    const auth = useAuth();
    const dispatch = useAppDispatch();
    const { data: restrictedLists } = useGetRestrictedListQuery({});

    const { isConnected } = useAppSelector((state) => state.lobby);

    const schema = yup.object({
        name: yup
            .string()
            .required(t('You must specify a name for the game'))
            .max(
                GameNameMaxLength,
                t(`Game name must be less than ${GameNameMaxLength} characters`)
            ),
        password: yup.string().optional(),
        gameTimeLimit: yup
            .number()
            .min(10, t('Games must be at least 10 minutes long'))
            .max(120, t('Games must be less than 2 hours')),
        gameFormat: yup.string().required(),
        gameType: yup.string().required()
    });

    const user = auth.user?.profile;

    const initialValues = {
        name: `${user?.name}'s game`,
        password: '',
        allowSpectators: true,
        gameFormat: 'normal',
        gameType: defaultGameType || GameType.Casual,
        useGameTimeLimit: !!defaultTimeLimit,
        gameTimeLimit: defaultTimeLimit || 55,
        gamePrivate: defaultPrivate,
        useChessBlocks: false,
        gameChessClockLimit: 30,
        dt: true
    };

    if (!isConnected) {
        return (
            <div>
                <Trans>
                    The connection to the lobby has been lost, waiting for it to be restored. If
                    this message persists, please refresh the page.
                </Trans>
            </div>
        );
    }

    return (
        <Panel title={t(quickJoin ? 'Quick Join' : 'New game')}>
            <Formik
                validationSchema={schema}
                onSubmit={(values) => {
                    // if (tournament) {
                    //     for (const match of matches) {
                    //         dispatch(
                    //             sendSocketMessage('newgame', {
                    //                 ...values,
                    //                 expansions: {
                    //                     aoa: values.aoa,
                    //                     cota: values.cota,
                    //                     wc: values.wc,
                    //                     mm: values.mm,
                    //                     dt: values.dt
                    //                 },
                    //                 name: `${getParticipantName(
                    //                     match.player1_id
                    //                 )} vs ${getParticipantName(match.player2_id)}`,
                    //                 challonge: { matchId: match.id, tournamentId: tournament.id },
                    //                 tournament: true
                    //             })
                    //         );
                    //         onClosed(true);
                    //     }
                    // } else {
                    //     values.expansions = {
                    //         aoa: values.aoa,
                    //         cota: values.cota,
                    //         wc: values.wc,
                    //         mm: values.mm,
                    //         dt: values.dt
                    //     };
                    //     values.quickJoin = quickJoin;
                    //     dispatch(sendSocketMessage('newgame', values));
                    // }

                    dispatch(lobbyActions.sendNewGame(values));
                }}
                initialValues={initialValues}
            >
                {(formProps) => (
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();

                            formProps.handleSubmit(event);
                        }}
                    >
                        {quickJoin && (
                            <Alert variant={AlertType.Info}>
                                <Trans>
                                    Select the type of game you&apos;d like to play and either
                                    you&apos;ll join the next one available, or one will be created
                                    for you with default options.
                                </Trans>
                            </Alert>
                        )}
                        {!quickJoin && (
                            <>
                                {
                                    /*!tournament &&*/ <>
                                        <div className='mb-2 w-1/2'>
                                            <Input
                                                label={t('Name')}
                                                endContent={
                                                    <span>
                                                        {GameNameMaxLength -
                                                            formProps.values.name.length}
                                                    </span>
                                                }
                                                // <Form.Label>
                                                //     {GameNameMaxLength -
                                                //         formProps.values.name.length}
                                                // </Form.Label>
                                                type='text'
                                                placeholder={t('Game Name')}
                                                maxLength={GameNameMaxLength}
                                                {...formProps.getFieldProps('name')}
                                                errorMessage={formProps.errors.name}
                                            />
                                        </div>
                                        <div className='mb-2 w-1/2'>
                                            <Select
                                                label={t('Mode')}
                                                {...formProps.getFieldProps('restrictedListId')}
                                            >
                                                {restrictedLists?.map((rl: RestrictedList) => (
                                                    <SelectItem key={rl.name} value={rl.id}>
                                                        {rl.name}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                        </div>
                                    </>
                                }
                                <GameOptions formProps={formProps} />
                            </>
                        )}
                        {/*!tournament &&  */ <GameTypes formProps={formProps} />}
                        {!quickJoin && (
                            <div className='mt-4 w-1/2'>
                                <Input
                                    label={t('Password')}
                                    type='password'
                                    placeholder={t('Enter a password')}
                                    {...formProps.getFieldProps('password')}
                                />
                            </div>
                        )}
                        <div className='mt-4'>
                            <Button color='success' type='submit'>
                                <Trans>Start</Trans>
                            </Button>
                            <Button
                                color='primary'
                                onClick={() => onClosed && onClosed()}
                                className='ms-1'
                            >
                                <Trans>Cancel</Trans>
                            </Button>
                        </div>
                    </form>
                )}
            </Formik>
        </Panel>
    );
};

export default NewGame;
