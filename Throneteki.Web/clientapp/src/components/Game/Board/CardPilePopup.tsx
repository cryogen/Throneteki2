import React from 'react';
import classNames from 'classnames';

import CardTiledList from './CardTiledList';
import Droppable from './Droppable';
import MovablePanel from './MovablePanel';

interface CardPilePopupProps {
    cards: any;
    disableMouseOver: any;
    manualMode: any;
    onCardClick: any;
    onCloseClick: any;
    onDragDrop: any;
    onMouseOut: any;
    onMouseOver: any;
    onTouchMove: any;
    popupLocation: any;
    popupMenu: any;
    size: any;
    source: any;
    title: any;
}

const CardPilePopup = ({
    cards,
    disableMouseOver,
    manualMode,
    onCardClick,
    onCloseClick,
    onDragDrop,
    onMouseOut,
    onMouseOver,
    onTouchMove,
    popupLocation,
    popupMenu,
    size,
    source,
    title
}: CardPilePopupProps) => {
    let popup = null;
    let cardList = [];

    const listProps = {
        disableMouseOver,
        manualMode,
        onCardClick,
        onCardMouseOut: onMouseOut,
        onCardMouseOver: onMouseOver,
        onTouchMove,
        size,
        source
    };

    if (cards && cards.some((card: any) => card.group)) {
        const cardGroup = cards.reduce((grouping: any, card: any) => {
            (grouping[card.group] = grouping[card.group] || []).push(card);

            return grouping;
        }, {});
        const sortedKeys = Object.keys(cardGroup).sort();
        for (const key of sortedKeys) {
            cardList.push(
                <CardTiledList cards={cardGroup[key]} key={key} title={key} {...listProps} />
            );
        }
    } else {
        cardList = [<CardTiledList key='one' cards={cards} {...listProps} />];
    }

    const popupClass = classNames('panel', 'panel-body', {
        'our-side': popupLocation === 'bottom',
        [size]: true
    });

    const innerClass = classNames('inner', {
        [size]: true,
        [source]: true
    });
    let linkIndex = 0;

    const popupMenuToRender = popupMenu && (
        <div>
            {popupMenu.map((menuItem: any) => {
                return (
                    <a
                        className='btn btn-default'
                        key={linkIndex++}
                        onClick={() => {
                            menuItem.handler && menuItem.handler();

                            onCloseClick();
                        }}
                    >
                        {menuItem.text}
                    </a>
                );
            })}
        </div>
    );

    popup = (
        <MovablePanel
            size={size}
            title={title}
            name={source}
            onCloseClick={onCloseClick}
            side={popupLocation}
        >
            <Droppable onDragDrop={onDragDrop} source={source} manualMode={manualMode}>
                <div className={popupClass} onClick={(event) => event.stopPropagation()}>
                    {popupMenuToRender}
                    <div className={innerClass}>{cardList}</div>
                </div>
            </Droppable>
        </MovablePanel>
    );

    return popup;
};

export default CardPilePopup;
