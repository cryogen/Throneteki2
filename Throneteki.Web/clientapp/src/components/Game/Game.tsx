import classNames from 'classnames';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpenReader, faClock, faLock } from '@fortawesome/free-solid-svg-icons';
import { Trans } from 'react-i18next';

import { LobbyGame } from '../../types/lobby';
import GamePlayerRow from './GamePlayerRow';
import { Button } from '@nextui-org/react';

interface GameProps {
    game: LobbyGame;
    onJoinGame: (game: LobbyGame) => void;
    showJoinButton: boolean;
    showWatchButton: boolean;
    // onRemoveGame={}
    // onWatchGame={}
    isAdmin: boolean;
}

const Game = ({ game, isAdmin, onJoinGame, showJoinButton, showWatchButton }: GameProps) => {
    const rowClass = classNames('game-row', {
        [game.node]: game.node && isAdmin
    });
    let timeDifference = moment().diff(moment(game.createdAt));
    if (timeDifference < 0) {
        timeDifference = 0;
    }
    const formattedTime = moment.utc(timeDifference).format('H:mm');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const watchGame = (game: LobbyGame) => {
        console.info('watchy watchy');
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const removeGame = (game: LobbyGame) => {
        console.info('removey removey');
    };

    return (
        <div key={game.id}>
            <hr />
            <div className={rowClass}>
                <div className='game-header-row'>
                    <span className='game-title me-1'>
                        <b>{game.name}</b>
                    </span>
                    <span className='game-time'>{`[${formattedTime}]`}</span>
                    <span className='game-icons'>
                        {game.showHand && <FontAwesomeIcon icon={faBookOpenReader} />}
                        {game.needsPassword && <FontAwesomeIcon icon={faLock} />}
                        {game.useGameTimeLimit && <FontAwesomeIcon icon={faClock} />}
                    </span>
                </div>
                <div className='game-middle-row'>
                    <GamePlayerRow
                        game={game}
                        allowJoin={showJoinButton}
                        onJoinGame={() => {
                            onJoinGame(game);
                        }}
                    />
                </div>
                <div className='game-row-buttons'>
                    {showWatchButton && (
                        <Button className='gamelist-button' onClick={() => watchGame(game)}>
                            <Trans>Watch</Trans>
                        </Button>
                    )}
                    {isAdmin && (
                        <Button className='gamelist-button' onClick={() => removeGame(game)}>
                            <Trans>Remove</Trans>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Game;
