import React from 'react';
import { CardMouseOverEventArgs, GameCard } from '../../../types/game';
import classNames from 'classnames';
import { useAppSelector } from '../../../redux/hooks';
import { Alert } from 'react-bootstrap';
import CardImage from './CardImage';
import Avatar from '../../Site/Avatar';
import CardBackImage from '../../../assets/img/cardback.png';
import GoldImage from '../../../assets/img/Gold.png';

interface MessagesProps {
    messages: any;
    onCardMouseOut: (card: GameCard) => void;
    onCardMouseOver?: (card: CardMouseOverEventArgs) => void;
}

const tokens: any = {
    card: { className: 'icon-card', imageSrc: CardBackImage },
    cards: { className: 'icon-card', imageSrc: CardBackImage },
    gold: { className: 'icon-gold', imageSrc: GoldImage }
};

const Messages = ({ messages, onCardMouseOut, onCardMouseOver }: MessagesProps) => {
    const { currentGame } = useAppSelector((state) => state.gameNode);

    const owner = currentGame.players[currentGame.owner];

    const processKeywords = (message: any) => {
        const messages = [];
        let i = 0;

        for (const token of message.split(' ')) {
            const lowerToken = token.toLowerCase();

            if (tokens[lowerToken]) {
                const tokenEntry = tokens[lowerToken];

                console.info(tokenEntry);
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

    const formatMessageText = (message: { [key: string]: any }): any => {
        let index = 0;
        const messages = [];

        for (const [key, fragment] of Object.entries(message)) {
            if (fragment === null || fragment === undefined) {
                messages.push('');

                continue;
            }

            if (key === 'alert') {
                const message: any = formatMessageText(fragment.message);
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
                            <Alert variant='success' key={index++}>
                                {message}
                            </Alert>
                        );
                        break;
                    case 'info':
                        messages.push(
                            <Alert variant='info' key={index++}>
                                {message}
                            </Alert>
                        );
                        break;
                    case 'danger':
                        messages.push(
                            <Alert variant='danger' key={index++}>
                                {message}
                            </Alert>
                        );
                        break;
                    case 'bell':
                        messages.push(
                            <Alert variant='bell' key={index++}>
                                {message}
                            </Alert>
                        );
                        break;
                    case 'warning':
                        messages.push(
                            <Alert variant='warning' key={index++}>
                                {message}
                            </Alert>
                        );
                        break;
                    default:
                        messages.push(message);
                        break;
                }
            } else if (fragment.message) {
                messages.push(formatMessageText(fragment.message));
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
                            image: <CardImage card={fragment} />,
                            size: 'normal'
                        })}
                        onMouseOut={() => onCardMouseOut && onCardMouseOut(fragment)}
                    >
                        {fragment.label}
                    </span>
                );
            } else if (fragment.code && fragment.label) {
                messages.push(
                    <span
                        key={index++}
                        className='card-link'
                        onMouseOver={onCardMouseOver.bind(this, fragment)}
                        onMouseOut={() => onCardMouseOut && onCardMouseOut(fragment)}
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
        return messages.map((message: any, index: number) => {
            const className = classNames('message', 'mb-1', {
                'this-player': message.activePlayer && message.activePlayer == owner.name,
                'other-player': message.activePlayer && message.activePlayer !== owner.name,
                'chat-bubble': Object.values(message.message).some(
                    (m: any) => m.name && m.argType === 'player'
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
