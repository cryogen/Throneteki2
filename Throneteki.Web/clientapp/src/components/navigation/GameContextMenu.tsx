import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { ThronetekiUser } from '../../types/user';
import { useAuth } from 'react-oidc-context';
import { toastr } from 'react-redux-toastr';
import { gameNodeActions } from '../../redux/slices/gameNodeSlice';
import { Link, NavbarMenuItem } from '@nextui-org/react';

const GameContextMenu = () => {
    const { t } = useTranslation();
    const [showPopup, setShowPopup] = useState(false);
    const { currentGame: activeGame } = useAppSelector((state) => state.gameNode);
    const auth = useAuth();
    const dispatch = useAppDispatch();

    const user = auth.user?.profile as ThronetekiUser;

    const isGameActive = () => {
        if (!activeGame || !user) {
            return false;
        }

        if (activeGame.winner) {
            return false;
        }

        let thisPlayer = activeGame.players[user.name];
        if (!thisPlayer) {
            thisPlayer = Object.values(activeGame.players)[0];
        }

        const otherPlayer = Object.values(activeGame.players).find((player) => {
            return player.name !== thisPlayer.name;
        });

        if (!otherPlayer) {
            return false;
        }

        if (otherPlayer.disconnected || otherPlayer.left) {
            return false;
        }

        return true;
    };

    const onLeaveClick = () => {
        if (!isSpectating && isGameActive()) {
            toastr.confirm(
                t(
                    'Your game is not finished. If you leave you will concede the game. Are you sure you want to leave?'
                ),
                {
                    okText: t('Ok'),
                    cancelText: t('Cancel'),
                    onOk: () => {
                        dispatch(gameNodeActions.sendConcedeMessage());
                        dispatch(gameNodeActions.sendLeaveGameMessage());
                        //                        dispatch(closeGameSocket());
                    }
                }
            );

            return;
        }

        dispatch(gameNodeActions.sendLeaveGameMessage());
        //dispatch(closeGameSocket());
    };

    if (!activeGame || !activeGame.started) {
        return null;
    }

    const isSpectating = !activeGame.players[user.name as string];
    const spectators = activeGame.spectators.map((spectator) => {
        return <li key={spectator.id}>{spectator.name}</li>;
    });
    const spectatorPopup = <ul className='spectators-popup absolute-panel mt-5'>{spectators}</ul>;

    return (
        <>
            <li
                onMouseOver={() => setShowPopup(true)}
                onMouseOut={() => setShowPopup(false)}
                className='font-[PoppinsMedium] text-large'
            >
                <span className='text-medium'>
                    {t('{{users}} spectators', { users: activeGame.spectators.length })}
                </span>
            </li>
            {showPopup && spectators.length > 0 && spectatorPopup}
            {!isSpectating && (
                <NavbarMenuItem>
                    <Link
                        className='font-[PoppinsMedium] text-emphasis transition-colors duration-500 ease-in-out hover:text-white'
                        onClick={() => dispatch(gameNodeActions.sendConcedeMessage())}
                    >
                        <Trans>Concede</Trans>
                    </Link>
                </NavbarMenuItem>
            )}
            <NavbarMenuItem className='font-[PoppinsMedium] text-emphasis transition-colors duration-500 ease-in-out hover:text-white'>
                <Link
                    className='font-[PoppinsMedium] text-emphasis transition-colors duration-500 ease-in-out hover:text-white'
                    onClick={onLeaveClick}
                >
                    <Trans>Leave Game</Trans>
                </Link>
            </NavbarMenuItem>
        </>
    );
};

export default GameContextMenu;
