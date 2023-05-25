import React, { MouseEventHandler, ReactNode, useEffect, useRef, useState } from 'react';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDrag } from 'react-dnd';
import { ItemTypes } from '../../../constants';
import { CardSize } from '../../../types/enums';

interface MovablePanelProps {
    children: ReactNode | ReactNode[];
    name: string;
    onCloseClick: MouseEventHandler;
    side: any;
    title: string;
    size: CardSize;
}

const PopupDefaults: any = {
    'plot deck-bottom': {
        left: '100px',
        bottom: '155px'
    },
    'revealed plots-bottom': {
        left: '100px',
        bottom: '230px'
    },
    'revealed plots-top': {
        left: '100px',
        top: '155px'
    },
    'draw deck-bottom': {
        bottom: '140px'
    },
    'discard pile-bottom': {
        bottom: '155px'
    },
    'discard pile-top': {
        top: '185px'
    },
    'dead pile-bottom': {
        bottom: '140px'
    },
    'dead pile-top': {
        top: '165px'
    },
    'out of game-top': {
        top: '155px',
        left: '20px'
    },
    'out of game-bottom': {
        bottom: '155px',
        right: '0'
    },
    'agenda-bottom': {
        bottom: '155px'
    },
    'agenda-top': {
        top: '185px'
    },
    'conclave-bottom': {
        bottom: '155px'
    }
};

const MovablePanel = ({ children, name, onCloseClick, side, title, size }: MovablePanelProps) => {
    const key = `${name}-${side}`;
    const savedStyle = localStorage.getItem(key);
    const style = (savedStyle && JSON.parse(savedStyle)) || PopupDefaults[key];

    if (style.left >= window.innerWidth) {
        style.left = window.innerWidth - 50;
    }

    if (style.top >= window.innerHeight) {
        style.top = window.innerHeight - 50;
    }

    const [position, setPosition] = useState(Object.assign({}, style));
    const popupRef = useRef<HTMLDivElement>(null);

    const getStyle = (offset: any) => {
        const style = {
            left: Math.max(offset.x, 10),
            top: Math.max(offset.y, 50),
            position: 'fixed'
        };

        const popup = popupRef.current;

        if (popup == null) {
            return style;
        }

        style.top -= popup.clientHeight;
        if (style.top < 50) {
            style.top = 50;
        }

        if (style.left + popup.clientWidth > window.innerWidth) {
            style.left = window.innerWidth - popup.clientWidth;
        }

        if (style.top + 50 > window.innerHeight) {
            style.top = window.innerHeight - 50;
        }

        return style;
    };

    const [{ isDragging, dragOffset }, drag] = useDrag(() => ({
        type: ItemTypes.CARD,
        item: { name: key, type: ItemTypes.PANEL },
        collect: (monitor) => {
            return {
                isDragging: monitor.isDragging(),
                dragOffset: monitor.getSourceClientOffset()
            };
        },
        end: (_, monitor) => {
            const offset = monitor.getSourceClientOffset();
            const style = getStyle(offset);

            localStorage.setItem(`${key}`, JSON.stringify(style));
        }
    }));

    useEffect(() => {
        if (isDragging) {
            setPosition(getStyle(dragOffset));
        }
    }, [dragOffset, isDragging]);

    const content = (
        <div ref={popupRef}>
            <div className={`panel panel-primary ${size}`} style={position}>
                <div
                    ref={drag}
                    className='panel-heading'
                    onClick={(event) => event.stopPropagation()}
                >
                    <span className='text-center'>{title}</span>
                    <span className='float-end'>
                        <a className='close-button' onClick={onCloseClick}>
                            <FontAwesomeIcon icon={faTimes} />
                        </a>
                    </span>
                </div>
                {children}
            </div>
        </div>
    );

    return content;
};

export default MovablePanel;
