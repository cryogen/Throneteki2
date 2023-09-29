import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Messages from './Messages';
import { CardMouseOverEventArgs, ChatMessage, GameCard } from '../../../types/game';
import { Input } from '@nextui-org/react';

interface GameChatProps {
    messages: ChatMessage[];
    muted: boolean;
    onCardMouseOut: (card: GameCard) => void;
    onCardMouseOver?: (card: CardMouseOverEventArgs) => void;
    onSendChat: (message: string) => void;
}

const GameChat = ({
    messages,
    muted,
    onCardMouseOut,
    onCardMouseOver,
    onSendChat
}: GameChatProps) => {
    const { t } = useTranslation();
    const messagePanel = useRef<HTMLDivElement>();
    const [canScroll, setCanScroll] = useState(true);
    const [message, setMessage] = useState('');

    const placeholder = muted ? 'Spectators cannot chat in this game' : 'Chat...';

    useEffect(() => {
        if (messagePanel.current && canScroll) {
            messagePanel.current.scrollTop = 999999;
        }
    });

    const onScroll = () => {
        setTimeout(() => {
            if (
                messagePanel.current &&
                messagePanel.current.scrollTop >=
                    messagePanel.current.scrollHeight - messagePanel.current.offsetHeight - 20
            ) {
                setCanScroll(true);
            } else {
                setCanScroll(false);
            }
        }, 500);
    };

    const sendMessage = () => {
        if (message === '') {
            return;
        }

        onSendChat(message);

        setMessage('');
    };

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            sendMessage();

            event.preventDefault();
        }
    };

    return (
        <div className='chat flex h-full flex-shrink flex-grow flex-col'>
            <div
                className='m-0 flex h-full flex-1 overflow-auto bg-black text-sm opacity-80'
                ref={(m) => (messagePanel.current = m)}
                onScroll={onScroll}
            >
                <Messages
                    messages={messages}
                    onCardMouseOver={onCardMouseOver}
                    onCardMouseOut={onCardMouseOut}
                />
            </div>
            <form className='chat-form'>
                <Input
                    className='form-control'
                    placeholder={t(placeholder)}
                    onKeyDown={onKeyDown}
                    onChange={(event) => {
                        setMessage(
                            event.target.value.substring(
                                0,
                                Math.min(512, event.target.value.length)
                            )
                        );
                    }}
                    value={message}
                    disabled={muted}
                />
            </form>
        </div>
    );
};

export default GameChat;
