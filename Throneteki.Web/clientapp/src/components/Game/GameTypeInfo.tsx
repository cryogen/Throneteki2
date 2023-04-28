import React from 'react';
import { Alert } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import { GameType } from '../../types/enums';

interface GameTypeInfoProps {
    gameType: GameType;
}

const GameTypeInfo = ({ gameType }: GameTypeInfoProps) => {
    switch (gameType) {
        case GameType.Beginner:
            console.info('fsdfs');
            return (
                <Alert variant='info'>
                    <Trans>
                        <strong>Beginner</strong> Playing in this category usually means you are
                        unfamiliar with the interface, and may take a long time to play your turns.
                        Basic game rule mistakes should be expected.
                    </Trans>
                </Alert>
            );
        case GameType.Casual:
            return (
                <Alert variant='info'>
                    <strong>Casual</strong> This category assumes you are familiar with the
                    interface and game to a basic level. Games should be informal and laid back.
                    Take-backs and the like would be expected to be permitted. Like you&apos;re
                    playing a friend. Bathroom breaks and distractions are to be expected.
                </Alert>
            );
        case GameType.Competitive:
            return (
                <Alert variant='info'>
                    <strong>Competitive</strong> A reasonable standard of play is to be expected, in
                    a tournament like setting. Prompt play with no excessive afking or rule errors.
                </Alert>
            );
    }

    return null;
};

export default GameTypeInfo;
