import React from 'react';

interface GameChatProps {
    messages: any;
    onCardMouseOut: any;
    onCardMouseOver: any;
    onSendChat: any;
    muted: boolean;
}

const GameChat = ({}: GameChatProps) => {
    return <div className='chat h-100 d-flex flex-column'>GameChat</div>;
};

export default GameChat;
