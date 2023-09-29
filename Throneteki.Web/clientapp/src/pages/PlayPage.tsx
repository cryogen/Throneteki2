import GameLobby from '../components/game/GameLobby';
import { useAppSelector } from '../redux/hooks';
import GameBoard from '../components/game/board/GameBoard';

const PlayPage = () => {
    const { currentGame: activeGame } = useAppSelector((state) => state.gameNode);

    return activeGame ? <GameBoard /> : <GameLobby />;
};

export default PlayPage;
