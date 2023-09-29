import { Trans } from 'react-i18next';
import { GameType } from '../../types/enums';
import Alert, { AlertType } from '../site/Alert';

interface GameTypeInfoProps {
    gameType: GameType;
}

const GameTypeInfo = ({ gameType }: GameTypeInfoProps) => {
    switch (gameType) {
        case GameType.Beginner:
            return (
                <Alert variant={AlertType.Info}>
                    <Trans>
                        <strong>Beginner</strong> Playing in this category usually means you are
                        unfamiliar with the interface, and may take a long time to play your turns.
                        Basic game rule mistakes should be expected.
                    </Trans>
                </Alert>
            );
        case GameType.Casual:
            return (
                <Alert variant={AlertType.Info}>
                    <strong>Casual</strong> This category assumes you are familiar with the
                    interface and game to a basic level. Games should be informal and laid back.
                    Take-backs and the like would be expected to be permitted. Like you&apos;re
                    playing a friend. Bathroom breaks and distractions are to be expected.
                </Alert>
            );
        case GameType.Competitive:
            return (
                <Alert variant={AlertType.Info}>
                    <strong>Competitive</strong> A reasonable standard of play is to be expected, in
                    a tournament like setting. Prompt play with no excessive afking or rule errors.
                </Alert>
            );
    }

    return null;
};

export default GameTypeInfo;
