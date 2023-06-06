import React from 'react';
import { CardMouseOverEventArgs, ChatMessage, GameCard } from '../../../types/game';
import classNames from 'classnames';
import { useAppSelector } from '../../../redux/hooks';
import ZoomCardImage from './ZoomCardImage';
import Avatar from '../../Site/Avatar';
import CardBackImage from '../../../assets/img/cardback.png';
import GoldImage from '../../../assets/img/Gold.png';
import AlertPanel, { AlertType } from '../../Site/AlertPanel';

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
    card: { className: 'icon-card', imageSrc: CardBackImage },
    cards: { className: 'icon-card', imageSrc: CardBackImage },
    gold: { className: 'icon-gold', imageSrc: GoldImage }
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
                        messages.push(
                            <div
                                className={'fw-bold text-light separator ' + fragment.type}
                                key={index++}
                            >
                                <hr className={'mt-2 mb-2 ' + fragment.type} />
                                {message}
                                {fragment.type === 'phasestart' && <hr />}
                            </div>
                        );
                        break;
                    case 'startofround':
                        messages.push(
                            <div
                                className={'fw-bold text-light separator ' + fragment.type}
                                key={index++}
                            >
                                {message}
                            </div>
                        );
                        break;
                    case 'success':
                        messages.push(
                            <AlertPanel type={AlertType.Success} key={index++}>
                                {message}
                            </AlertPanel>
                        );
                        break;
                    case 'info':
                        messages.push(
                            <AlertPanel type={AlertType.Info} key={index++}>
                                {message}
                            </AlertPanel>
                        );
                        break;
                    case 'danger':
                        messages.push(
                            <AlertPanel type={AlertType.Danger} key={index++}>
                                {message}
                            </AlertPanel>
                        );
                        break;
                    case 'bell':
                        messages.push(
                            <AlertPanel type={AlertType.Bell} key={index++}>
                                {message}
                            </AlertPanel>
                        );
                        break;
                    case 'warning':
                        messages.push(
                            <AlertPanel type={AlertType.Warning} key={index++}>
                                {message}
                            </AlertPanel>
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
                    <a href={fragment.link} target='_blank' rel='noopener noreferrer'>
                        {fragment.label}
                    </a>
                );
            } else if (fragment.image && fragment.label) {
                messages.push(
                    <span
                        key={index++}
                        className='card-link'
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
                        className='card-link'
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
                        <Avatar avatar={fragment.avatar} float />
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
            const className = classNames('message', 'mb-1', {
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
