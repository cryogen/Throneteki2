import React from 'react';
import GameLobby from '../components/Game/GameLobby';
import { useAppSelector } from '../redux/hooks';
import GameBoard from '../components/Game/Board/GameBoard';

const PlayPage = () => {
    const { currentGame: activeGame } = useAppSelector((state) => state.gameNode);

    return activeGame ? <GameBoard /> : <GameLobby />;
};

export default PlayPage;
