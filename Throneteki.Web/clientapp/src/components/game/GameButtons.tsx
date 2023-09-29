import { Button } from '@nextui-org/react';
import { Trans } from 'react-i18next';
import { useAuth } from 'react-oidc-context';

interface GameButtonsProps {
    onNewGame: () => void;
}

const GameButtons = ({ onNewGame }: GameButtonsProps) => {
    const auth = useAuth();
    const user = auth.user?.profile;

    return (
        <>
            <Button disabled={!user} color='primary' onClick={() => onNewGame && onNewGame()}>
                <Trans>New Game</Trans>
            </Button>
            <Button
                className='mt-2'
                disabled={!user}
                color='primary'
                onClick={() => {
                    // setQuickJoin(true);
                    // dispatch(startNewGame());
                }}
            >
                <Trans>Quick Join</Trans>
            </Button>
        </>
    );
};

export default GameButtons;
