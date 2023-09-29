import { useTranslation, Trans } from 'react-i18next';
import { LobbyGame } from '../../types/lobby';
import { ThronetekiUser } from '../../types/user';
import Panel from '../site/Panel';
import DeckStatus from '../decks/DeckStatus';
import { Avatar, Button } from '@nextui-org/react';

interface PendingGamePlayersProps {
    currentGame: LobbyGame;
    user: ThronetekiUser;
    onSelectDeck: () => void;
}

const PendingGamePlayers = ({ currentGame, user, onSelectDeck }: PendingGamePlayersProps) => {
    const { t } = useTranslation();

    let firstPlayer = true;
    return (
        <Panel title={t('Players')}>
            {Object.values(currentGame.players).map((player) => {
                const playerIsMe = player && player.user.username === user?.name;

                let deck = null;
                let selectLink = null;
                let status = null;

                if (player && player.deckSelected) {
                    if (playerIsMe) {
                        deck = (
                            <Button className='ml-2 mr-2' onClick={onSelectDeck}>
                                {player.deckName}
                            </Button>
                        );
                    } else {
                        deck = (
                            <span className='deck-selection mr-2'>
                                <Trans>Deck Selected</Trans>
                            </span>
                        );
                    }

                    status = <DeckStatus status={player.deckStatus} />;
                } else if (player && playerIsMe) {
                    selectLink = (
                        <Button className='ml-2' onClick={onSelectDeck}>
                            <Trans>Select Deck</Trans>
                        </Button>
                    );
                }
                const userClass =
                    'ml-2 username' +
                    (player.user.role ? ` ${player.user.role.toLowerCase()}-role` : '');
                let rowClass = 'flex items-center ';
                if (firstPlayer) {
                    rowClass += 'mb-2';

                    firstPlayer = false;
                }
                return (
                    <div className={rowClass} key={player.user.username}>
                        <Avatar src={player.user.avatar} name={player.user.username} showFallback />
                        <span className={userClass}>{player.user.username}</span>
                        {deck} {status} {selectLink}
                    </div>
                );
            })}
        </Panel>
    );
};

export default PendingGamePlayers;
