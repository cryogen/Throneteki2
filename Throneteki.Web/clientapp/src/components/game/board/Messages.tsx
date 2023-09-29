import { CardMouseOverEventArgs, ChatMessage, GameCard } from '../../../types/game';
import classNames from 'classnames';
import { useAppSelector } from '../../../redux/hooks';
import ZoomCardImage from './ZoomCardImage';
import CardBackImage from '../../../assets/img/cardback.png';
import GoldImage from '../../../assets/img/Gold.png';
import Alert, { AlertType } from '../../site/Alert';
import { Link } from '@nextui-org/react';

import './Messages.css';

interface MessagesProps {
    messages: ChatMessage[];
    onCardMouseOut: (card: GameCard) => void;
    onCardMouseOver?: (card: CardMouseOverEventArgs) => void;
}

interface ChatToken {
    className: string;
    imageSrc: string;
}

const tokens: { [key: string]: ChatToken } = {
    card: { className: 'h-4 w-3 inline', imageSrc: CardBackImage },
    cards: { className: 'h-4 w-3 inline', imageSrc: CardBackImage },
    gold: { className: 'h-3 w-3 inline -mt-1', imageSrc: GoldImage }
};

const Messages = ({ messages, onCardMouseOut, onCardMouseOver }: MessagesProps) => {
    const { currentGame } = useAppSelector((state) => state.gameNode);

    const owner = currentGame.players[currentGame.owner];

    const processKeywords = (message: string) => {
        const messages = [];
        let i = 0;

        for (const token of message.split(' ')) {
            const lowerToken = token.toLowerCase();

            if (tokens[lowerToken]) {
                const tokenEntry = tokens[lowerToken];

                messages.push(` ${token} `);
                messages.push(
                    <img
                        key={`${token}-${i++}`}
                        className={tokenEntry.className}
                        src={tokenEntry.imageSrc}
                    />
                );
                messages.push(' ');
            } else {
                messages.push(token + ' ');
            }
        }

        return messages;
    };

    const formatMessageText = (message: { [key: string]: ChatMessage }): JSX.Element[] => {
        let index = 0;
        const messages: JSX.Element[] = [];

        for (const [key, fragment] of Object.entries(message)) {
            if (fragment === null || fragment === undefined) {
                messages.push(null);

                continue;
            }

            if (key === 'alert') {
                const message: JSX.Element[] = formatMessageText(fragment.message);
                switch (fragment.type) {
                    case 'endofround':
                    case 'phasestart':
                        // eslint-disable-next-line no-var
                        var sepClass = classNames('font-bold', {
                            'text-md': fragment.type === 'phasestart',
                            capitalize: fragment.type === 'phasestart'
                        });
                        messages.push(
                            <div className={sepClass} key={index++}>
                                <hr className={'mb-4 mt-2 border-primary ' + fragment.type} />
                                {message}
                                {fragment.type === 'phasestart' && (
                                    <hr className='mt-4 border-primary' />
                                )}
                            </div>
                        );
                        break;
                    case 'startofround':
                        messages.push(
                            <div className={'separator font-bold ' + fragment.type} key={index++}>
                                {message}
                            </div>
                        );
                        break;
                    case 'success':
                    case 'info':
                    case 'danger':
                    case 'bell':
                    case 'warning':
                        messages.push(
                            <Alert variant={fragment.type as AlertType} key={index++} size={'sm'}>
                                {message}
                            </Alert>
                        );
                        break;

                    default:
                        messages.concat(message);
                        break;
                }
            } else if (fragment.message) {
                messages.concat(formatMessageText(fragment.message));
            } else if (fragment.link && fragment.label) {
                messages.push(
                    <Link isExternal href={fragment.link}>
                        {fragment.label}
                    </Link>
                );
            } else if (fragment.image && fragment.label) {
                messages.push(
                    <span
                        key={index++}
                        className='cursor-pointer text-secondary hover:text-info'
                        onMouseOver={onCardMouseOver.bind(this, {
                            image: <ZoomCardImage imageUrl={`/img/cards/${fragment.code}.png`} />,
                            size: 'normal'
                        })}
                        onMouseOut={() =>
                            onCardMouseOut && onCardMouseOut(fragment as unknown as GameCard)
                        }
                    >
                        {fragment.label}
                    </span>
                );
            } else if (fragment.code && fragment.label) {
                messages.push(
                    <span
                        key={index++}
                        className='cursor-pointer text-secondary hover:text-info'
                        onMouseOver={onCardMouseOver.bind(this, {
                            image: <ZoomCardImage imageUrl={`/img/cards/${fragment.code}.png`} />,
                            size: 'normal'
                        })}
                        onMouseOut={() =>
                            onCardMouseOut && onCardMouseOut(fragment as unknown as GameCard)
                        }
                    >
                        {fragment.label}
                    </span>
                );
            } else if (fragment.name && fragment.argType === 'player') {
                const userClass =
                    'username' + (fragment.role ? ` ${fragment.role.toLowerCase()}-role` : '');

                messages.push(
                    <div key={index++} className='message-chat'>
                        <span key={index++} className={userClass}>
                            {fragment.name}
                        </span>
                    </div>
                );
            } else if (fragment.argType === 'nonAvatarPlayer') {
                const userClass =
                    'username' + (fragment.role ? ` ${fragment.role.toLowerCase()}-role` : '');

                messages.push(
                    <span key={index++} className={userClass}>
                        {fragment.name}
                    </span>
                );
            } else {
                const messageFragment = processKeywords(fragment.toString());
                messages.push(
                    <span key={index++} className='message-fragment'>
                        {messageFragment}
                    </span>
                );
            }
        }

        return messages;
    };

    const renderMessages = () => {
        return messages.map((message: ChatMessage, index: number) => {
            const className = classNames('break-words leading-3 pt-0 pl-2 pb-2 pr-2 max-w-xs', '', {
                'this-player': message.activePlayer && message.activePlayer == owner.name,
                'other-player': message.activePlayer && message.activePlayer !== owner.name,
                'chat-bubble': Object.values(message.message).some(
                    (m: ChatMessage) => m.name && m.argType === 'player'
                )
            });
            return (
                <div key={index} className={className}>
                    {formatMessageText(message.message)}
                </div>
            );
        });
    };

    return <div>{renderMessages()} </div>;
};

export default Messages;
