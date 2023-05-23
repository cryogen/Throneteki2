import React, { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import Messages from './Messages';
import { CardMouseOverEventArgs, GameCard } from '../../../types/game';

interface GameChatProps {
    messages: any;
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
        if (canScroll) {
            messagePanel.current.scrollTop = 999999;
        }
    }, [canScroll]);

    const onScroll = () => {
        const messages = messagePanel;

        setTimeout(() => {
            if (
                messages.current.scrollTop >=
                messages.current.scrollHeight - messages.current.offsetHeight - 20
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
        <div className='chat h-100 d-flex flex-column flex-grow-1 flex-shrink-1'>
            <div
                className='messages panel'
                ref={(m) => (messagePanel.current = m)}
                onScroll={onScroll}
            >
                <Messages
                    messages={messages}
                    onCardMouseOver={onCardMouseOver}
                    onCardMouseOut={onCardMouseOut}
                />
            </div>
            <Form className='chat-form'>
                <Form.Control
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
            </Form>
        </div>
    );
};

export default GameChat;
